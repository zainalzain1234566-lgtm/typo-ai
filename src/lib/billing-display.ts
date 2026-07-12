export function planLabel(plan: "free" | "paid") {
  return plan === "paid" ? "مدفوعة" : "مجانية";
}

export function formatAvailableCredit(microUsd: number) {
  return `$${(microUsd / 1_000_000).toFixed(2)}`;
}
