export const PROJECT_CREDIT_RESERVE_MICRO_USD = 1_000_000;

type ProjectCreationAccessInput = {
  operation: "generate" | "duplicate";
  plan: "free" | "paid";
  subscriptionStatus: "inactive" | "active" | "expired" | "canceled";
  freeProjectsRemaining: number;
  creditBalanceMicroUsd: number;
};

export type ProjectCreationAccessReason = "paid_active" | "free_available" | "free_limit_reached" | "insufficient_credit";

export function getProjectCreationAccess(input: ProjectCreationAccessInput): { allowed: boolean; reason: ProjectCreationAccessReason } {
  if (input.plan === "paid" && input.subscriptionStatus === "active") {
    return input.operation === "duplicate" || input.creditBalanceMicroUsd >= PROJECT_CREDIT_RESERVE_MICRO_USD
      ? { allowed: true, reason: "paid_active" }
      : { allowed: false, reason: "insufficient_credit" };
  }
  return input.freeProjectsRemaining > 0
    ? { allowed: true, reason: "free_available" }
    : { allowed: false, reason: "free_limit_reached" };
}
