export type DesignerOperation = "generate" | "edit";
export type SubscriptionStatus = "inactive" | "active" | "expired" | "canceled";
export type DesignerAccessReason = "trial_available" | "paid_active" | "trial_ended" | "subscription_inactive" | "insufficient_credit";
export const DESIGNER_CREDIT_RESERVE_MICRO_USD = 1_000_000;

export interface DesignerAccessInput {
  operation: DesignerOperation;
  freeUsesRemaining: number;
  plan: "free" | "paid";
  subscriptionStatus: SubscriptionStatus;
  creditBalanceMicroUsd: number;
}

export function getDesignerAccess(input: DesignerAccessInput): { allowed: boolean; reason: DesignerAccessReason } {
  if (input.plan === "paid" && input.subscriptionStatus === "active") {
    return input.creditBalanceMicroUsd >= DESIGNER_CREDIT_RESERVE_MICRO_USD
      ? { allowed: true, reason: "paid_active" }
      : { allowed: false, reason: "insufficient_credit" };
  }
  if (input.operation === "generate" && input.freeUsesRemaining > 0) return { allowed: true, reason: "trial_available" };
  return { allowed: false, reason: input.operation === "generate" ? "trial_ended" : "subscription_inactive" };
}

export function customerCostMicroUsd(providerCostMicroUsd: number): number {
  return Math.ceil(providerCostMicroUsd * 1.2);
}
