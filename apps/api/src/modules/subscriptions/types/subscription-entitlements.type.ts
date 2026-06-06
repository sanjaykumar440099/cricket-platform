import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export interface SubscriptionEntitlements {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyMatchLimit: number | null;
  monthlyTournamentLimit: number | null;
  monthlyPrice: number;
  currency: string;
  canExportMatches: boolean;
  canGenerateBasicCommentary: boolean;
  canGenerateAdvancedCommentary: boolean;
  canAccessAiSummary: boolean;
  commentaryStyle: 'basic' | 'enhanced' | 'advanced';
  hasPublicLiveWidgets: boolean;
  hasPrioritySupport: boolean;
  hasWhiteLabelBranding: boolean;
  supportLevel: 'community' | 'standard' | 'priority' | 'enterprise';
}
