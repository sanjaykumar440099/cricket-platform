import {
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

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repo: Repository<SubscriptionEntity>,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
  ) {}

  getPlanCatalog() {
    return [
      {
        plan: SubscriptionPlan.FREE,
        price: 0,
        monthlyMatchLimit: 3,
        features: [
          'Basic live scoring',
          'Rule-based AI commentary',
          'Leaderboard and match summary APIs',
        ],
      },
      {
        plan: SubscriptionPlan.BASIC,
        price: 9,
        monthlyMatchLimit: 25,
        features: [
          'Everything in Free',
          'Paid match exports',
          'AI match summaries',
          'Public live widgets',
        ],
      },
      {
        plan: SubscriptionPlan.PREMIUM,
        price: 29,
        monthlyMatchLimit: null,
        features: [
          'Everything in Basic',
          'Unlimited matches',
          'Advanced AI commentary tone',
          'Premium match intelligence output',
        ],
      },
    ];
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
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    subscription.plan = plan;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.provider =
      plan === SubscriptionPlan.FREE ? 'self-serve' : 'mock-billing';
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd =
      plan === SubscriptionPlan.FREE ? null : periodEnd;

    return this.repo.save(subscription);
  }

  async cancel(userId: string) {
    const subscription = await this.ensureDefaultSubscription(userId);
    subscription.status = SubscriptionStatus.CANCELED;
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

    if (activePlan === SubscriptionPlan.PREMIUM) {
      return {
        plan: activePlan,
        status: subscription.status,
        monthlyMatchLimit: null,
        canExportMatches: true,
        canGenerateBasicCommentary: true,
        canGenerateAdvancedCommentary: true,
        canAccessAiSummary: true,
        commentaryStyle: 'advanced',
        hasPublicLiveWidgets: true,
      };
    }

    if (activePlan === SubscriptionPlan.BASIC) {
      return {
        plan: activePlan,
        status: subscription.status,
        monthlyMatchLimit: 25,
        canExportMatches: true,
        canGenerateBasicCommentary: true,
        canGenerateAdvancedCommentary: false,
        canAccessAiSummary: true,
        commentaryStyle: 'enhanced',
        hasPublicLiveWidgets: true,
      };
    }

    return {
      plan: SubscriptionPlan.FREE,
      status: subscription.status,
      monthlyMatchLimit: 3,
      canExportMatches: false,
      canGenerateBasicCommentary: true,
      canGenerateAdvancedCommentary: false,
      canAccessAiSummary: false,
      commentaryStyle: 'basic',
      hasPublicLiveWidgets: false,
    };
  }
}
