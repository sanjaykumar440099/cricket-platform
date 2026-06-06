import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionPlan } from './enums/subscription-plan.enum';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { MatchEntity } from '../matches/entities/match.entity';
import { SubscriptionEntitlements } from './types/subscription-entitlements.type';

interface PlanCatalogItem {
  plan: SubscriptionPlan;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month';
  monthlyMatchLimit: number | null;
  monthlyTournamentLimit: number | null;
  features: string[];
  highlighted?: boolean;
  isEnterprise?: boolean;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repo: Repository<SubscriptionEntity>,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
  ) {}

  getPlanCatalog(): PlanCatalogItem[] {
    return [
      {
        plan: SubscriptionPlan.FREE,
        name: 'Free',
        description: 'For testing score entry and small local fixtures.',
        price: 0,
        currency: 'USD',
        interval: 'month',
        monthlyMatchLimit: 3,
        monthlyTournamentLimit: 1,
        features: [
          'Basic live scoring',
          'Rule-based AI commentary',
          'Leaderboard and match summary APIs',
        ],
      },
      {
        plan: SubscriptionPlan.BASIC,
        name: 'Basic',
        description: 'For clubs running recurring local tournaments.',
        price: 9,
        currency: 'USD',
        interval: 'month',
        monthlyMatchLimit: 25,
        monthlyTournamentLimit: 5,
        features: [
          'Everything in Free',
          'Paid match exports',
          'AI match summaries',
          'Public live widgets',
        ],
      },
      {
        plan: SubscriptionPlan.PREMIUM,
        name: 'Premium',
        description: 'For organizers who need unlimited matches and richer match intelligence.',
        price: 29,
        currency: 'USD',
        interval: 'month',
        monthlyMatchLimit: null,
        monthlyTournamentLimit: 25,
        highlighted: true,
        features: [
          'Everything in Basic',
          'Unlimited matches',
          'Advanced AI commentary tone',
          'Premium match intelligence output',
        ],
      },
      {
        plan: SubscriptionPlan.ENTERPRISE,
        name: 'Enterprise',
        description: 'Monthly SaaS billing for tournament networks, academies, and leagues.',
        price: 149,
        currency: 'USD',
        interval: 'month',
        monthlyMatchLimit: null,
        monthlyTournamentLimit: null,
        highlighted: true,
        isEnterprise: true,
        features: [
          'Everything in Premium',
          'Unlimited tournaments and venues',
          'White-label live centre branding',
          'Priority support for matchday operations',
          'Enterprise billing metadata for provider integration',
        ],
      },
    ];
  }

  private getCatalogItem(plan: SubscriptionPlan): PlanCatalogItem {
    const catalogItem = this.getPlanCatalog().find(item => item.plan === plan);

    if (!catalogItem) {
      throw new BadRequestException('Unsupported subscription plan.');
    }

    return catalogItem;
  }

  async ensureDefaultSubscription(userId: string) {
    const existing = await this.repo.findOne({ where: { userId } });
    if (existing) {
      return existing;
    }

    const now = new Date();
    const defaultSubscription = this.repo.create({
      userId,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      provider: 'self-serve',
      billingInterval: 'month',
      monthlyPrice: 0,
      currency: 'USD',
      providerCustomerId: null,
      providerSubscriptionId: null,
      cancelAtPeriodEnd: false,
      currentPeriodStart: now,
      currentPeriodEnd: null,
    });

    return this.repo.save(defaultSubscription);
  }

  async getByUserId(userId: string) {
    return this.ensureDefaultSubscription(userId);
  }

  async getEntitlementsForUser(
    userId: string,
  ): Promise<SubscriptionEntitlements> {
    const subscription = await this.ensureDefaultSubscription(userId);
    return this.buildEntitlements(subscription);
  }

  async updatePlan(userId: string, plan: SubscriptionPlan) {
    const subscription = await this.ensureDefaultSubscription(userId);
    const catalogItem = this.getCatalogItem(plan);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    subscription.plan = plan;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.provider = this.providerForPlan(plan);
    subscription.billingInterval = 'month';
    subscription.monthlyPrice = catalogItem.price;
    subscription.currency = catalogItem.currency;
    subscription.providerCustomerId =
      plan === SubscriptionPlan.FREE
        ? null
        : subscription.providerCustomerId ?? `cus_mock_${userId.slice(0, 8)}`;
    subscription.providerSubscriptionId =
      plan === SubscriptionPlan.FREE
        ? null
        : `${plan}_${now.getTime()}`;
    subscription.cancelAtPeriodEnd = false;
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd =
      plan === SubscriptionPlan.FREE ? null : periodEnd;

    return this.repo.save(subscription);
  }

  async checkoutMonthly(userId: string, plan: SubscriptionPlan) {
    const catalogItem = this.getCatalogItem(plan);
    const subscription = await this.updatePlan(userId, plan);

    return {
      subscription,
      billing: {
        provider: subscription.provider,
        interval: catalogItem.interval,
        amount: catalogItem.price,
        currency: catalogItem.currency,
        status:
          plan === SubscriptionPlan.ENTERPRISE
            ? 'enterprise_monthly_active'
            : 'monthly_subscription_active',
      },
    };
  }

  private providerForPlan(plan: SubscriptionPlan) {
    if (plan === SubscriptionPlan.FREE) {
      return 'self-serve';
    }

    if (plan === SubscriptionPlan.ENTERPRISE) {
      return 'manual-enterprise-monthly';
    }

    return 'mock-billing';
  }

  async cancel(userId: string) {
    const subscription = await this.ensureDefaultSubscription(userId);
    if (subscription.currentPeriodEnd && subscription.plan !== SubscriptionPlan.FREE) {
      subscription.cancelAtPeriodEnd = true;
    } else {
      subscription.status = SubscriptionStatus.CANCELED;
    }
    return this.repo.save(subscription);
  }

  async assertCanCreateMatch(userId: string) {
    const entitlements = await this.getEntitlementsForUser(userId);
    if (entitlements.monthlyMatchLimit === null) {
      return entitlements;
    }

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const createdThisMonth = await this.matchRepo.count({
      where: {
        createdByUserId: userId,
        createdAt: MoreThanOrEqual(monthStart),
      },
    });

    if (createdThisMonth >= entitlements.monthlyMatchLimit) {
      throw new ForbiddenException(
        `Your ${entitlements.plan} plan allows ${entitlements.monthlyMatchLimit} matches per month.`,
      );
    }

    return entitlements;
  }

  async assertCanExport(userId: string) {
    const entitlements = await this.getEntitlementsForUser(userId);
    if (!entitlements.canExportMatches) {
      throw new ForbiddenException(
        'Match export is available on basic and premium plans.',
      );
    }

    return entitlements;
  }

  async assertCanAccessAiSummary(userId: string) {
    const entitlements = await this.getEntitlementsForUser(userId);
    if (!entitlements.canAccessAiSummary) {
      throw new ForbiddenException(
        'AI match summaries are available on basic and premium plans.',
      );
    }

    return entitlements;
  }

  async getCommentaryStyle(userId: string) {
    const entitlements = await this.getEntitlementsForUser(userId);
    return entitlements.commentaryStyle;
  }

  buildEntitlements(
    subscription: SubscriptionEntity,
  ): SubscriptionEntitlements {
    const activePlan =
      subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.TRIALING
        ? subscription.plan
        : SubscriptionPlan.FREE;

    if (activePlan === SubscriptionPlan.ENTERPRISE) {
      return {
        plan: activePlan,
        status: subscription.status,
        monthlyMatchLimit: null,
        monthlyTournamentLimit: null,
        monthlyPrice: subscription.monthlyPrice,
        currency: subscription.currency,
        canExportMatches: true,
        canGenerateBasicCommentary: true,
        canGenerateAdvancedCommentary: true,
        canAccessAiSummary: true,
        commentaryStyle: 'advanced',
        hasPublicLiveWidgets: true,
        hasPrioritySupport: true,
        hasWhiteLabelBranding: true,
        supportLevel: 'enterprise',
      };
    }

    if (activePlan === SubscriptionPlan.PREMIUM) {
      return {
        plan: activePlan,
        status: subscription.status,
        monthlyMatchLimit: null,
        monthlyTournamentLimit: 25,
        monthlyPrice: subscription.monthlyPrice,
        currency: subscription.currency,
        canExportMatches: true,
        canGenerateBasicCommentary: true,
        canGenerateAdvancedCommentary: true,
        canAccessAiSummary: true,
        commentaryStyle: 'advanced',
        hasPublicLiveWidgets: true,
        hasPrioritySupport: true,
        hasWhiteLabelBranding: false,
        supportLevel: 'priority',
      };
    }

    if (activePlan === SubscriptionPlan.BASIC) {
      return {
        plan: activePlan,
        status: subscription.status,
        monthlyMatchLimit: 25,
        monthlyTournamentLimit: 5,
        monthlyPrice: subscription.monthlyPrice,
        currency: subscription.currency,
        canExportMatches: true,
        canGenerateBasicCommentary: true,
        canGenerateAdvancedCommentary: false,
        canAccessAiSummary: true,
        commentaryStyle: 'enhanced',
        hasPublicLiveWidgets: true,
        hasPrioritySupport: false,
        hasWhiteLabelBranding: false,
        supportLevel: 'standard',
      };
    }

    return {
      plan: SubscriptionPlan.FREE,
      status: subscription.status,
      monthlyMatchLimit: 3,
      monthlyTournamentLimit: 1,
      monthlyPrice: 0,
      currency: subscription.currency,
      canExportMatches: false,
      canGenerateBasicCommentary: true,
      canGenerateAdvancedCommentary: false,
      canAccessAiSummary: false,
      commentaryStyle: 'basic',
      hasPublicLiveWidgets: false,
      hasPrioritySupport: false,
      hasWhiteLabelBranding: false,
      supportLevel: 'community',
    };
  }
}
