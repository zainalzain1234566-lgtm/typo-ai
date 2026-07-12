const UPGRADE_MESSAGE = "Hello, I would like to subscribe to the Typo AI paid plan.";

export function getWhatsAppUpgradeUrl(number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER): string | null {
  const digits = number?.replace(/\D/g, "") ?? "";
  if (!digits) return null;
  const international = digits.startsWith("0") ? `964${digits.slice(1)}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(UPGRADE_MESSAGE)}`;
}
