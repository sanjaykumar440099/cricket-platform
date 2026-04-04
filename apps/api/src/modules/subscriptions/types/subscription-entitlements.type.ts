import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export interface SubscriptionEntitlements {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyMatchLimit: number | null;
  canExportMatches: boolean;
  canGenerateBasicCommentary: boolean;
  canGenerateAdvancedCommentary: boolean;
  canAccessAiSummary: boolean;
  commentaryStyle: 'basic' | 'enhanced' | 'advanced';
  hasPublicLiveWidgets: boolean;
}
