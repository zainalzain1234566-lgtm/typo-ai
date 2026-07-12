import assert from "node:assert/strict";
import test from "node:test";
import { formatAvailableCredit, planLabel } from "../src/lib/billing-display";

test("formats free and paid account billing details", () => {
  assert.equal(planLabel("free"), "مجانية");
  assert.equal(planLabel("paid"), "مدفوعة");
  assert.equal(formatAvailableCredit(0), "$0.00");
  assert.equal(formatAvailableCredit(12345678), "$12.35");
});
