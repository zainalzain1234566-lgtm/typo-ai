import assert from "node:assert/strict";
import test from "node:test";
import { getWhatsAppUpgradeUrl } from "../src/lib/whatsapp";

test("builds an Iraqi WhatsApp upgrade URL from a local number", () => {
  assert.equal(
    getWhatsAppUpgradeUrl("07729243035"),
    "https://wa.me/9647729243035?text=Hello%2C%20I%20would%20like%20to%20subscribe%20to%20the%20Typo%20AI%20paid%20plan."
  );
});
