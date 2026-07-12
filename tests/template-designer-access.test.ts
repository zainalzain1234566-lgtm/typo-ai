import assert from "node:assert/strict";
import test from "node:test";
import { customerCostMicroUsd, getDesignerAccess, resolveDesignerModel } from "../src/lib/template-designer-access";

test("allows a new template while a lifetime free use remains", () => {
  const access = getDesignerAccess({
    operation: "generate",
    freeUsesRemaining: 1,
    plan: "free",
    subscriptionStatus: "inactive",
    creditBalanceMicroUsd: 0,
  });

  assert.deepEqual(access, { allowed: true, reason: "trial_available" });
});

test("requires paid credit once free uses end and for edits", () => {
  assert.deepEqual(
    getDesignerAccess({
      operation: "generate",
      freeUsesRemaining: 0,
      plan: "free",
      subscriptionStatus: "inactive",
      creditBalanceMicroUsd: 1000000,
    }),
    { allowed: false, reason: "trial_ended" }
  );
  assert.deepEqual(
    getDesignerAccess({
      operation: "edit",
      freeUsesRemaining: 2,
      plan: "paid",
      subscriptionStatus: "active",
      creditBalanceMicroUsd: 0,
    }),
    { allowed: false, reason: "insufficient_credit" }
  );
  assert.deepEqual(
    getDesignerAccess({
      operation: "edit",
      freeUsesRemaining: 2,
      plan: "paid",
      subscriptionStatus: "active",
      creditBalanceMicroUsd: 999999,
    }),
    { allowed: false, reason: "insufficient_credit" }
  );
  assert.deepEqual(
    getDesignerAccess({
      operation: "edit",
      freeUsesRemaining: 2,
      plan: "paid",
      subscriptionStatus: "active",
      creditBalanceMicroUsd: 1000000,
    }),
    { allowed: true, reason: "paid_active" }
  );
  assert.deepEqual(
    getDesignerAccess({
      operation: "edit",
      freeUsesRemaining: 2,
      plan: "free",
      subscriptionStatus: "inactive",
      creditBalanceMicroUsd: 5000000,
    }),
    { allowed: false, reason: "subscription_inactive" }
  );
});

test("uses paid credit before free trial uses", () => {
  assert.deepEqual(
    getDesignerAccess({
      operation: "generate",
      freeUsesRemaining: 2,
      plan: "paid",
      subscriptionStatus: "active",
      creditBalanceMicroUsd: 4961000,
    }),
    { allowed: true, reason: "paid_active" }
  );
});

test("adds the required twenty percent markup using integer micro-USD", () => {
  assert.equal(customerCostMicroUsd(100001), 120002);
});

test("limits free accounts to DeepSeek Flash while paid accounts keep their model", () => {
  assert.equal(
    resolveDesignerModel("free", "inactive", "deepseek/deepseek-v4-pro"),
    "deepseek/deepseek-v4-flash"
  );
  assert.equal(
    resolveDesignerModel("paid", "active", "deepseek/deepseek-v4-pro"),
    "deepseek/deepseek-v4-pro"
  );
  assert.equal(
    resolveDesignerModel("paid", "expired", "minimax/minimax-m3"),
    "deepseek/deepseek-v4-flash"
  );
});
