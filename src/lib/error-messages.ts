const KNOWN_MESSAGES: Record<string, string> = {
  "User already registered": "هذا البريد مسجل بالفعل",
  "غير مصرح": "يجب تسجيل الدخول لإتمام هذا الإجراء",
};

/** Maps raw provider/action error strings to a localized, user-safe Arabic message. */
export function friendlyAuthError(raw: string): string {
  if (KNOWN_MESSAGES[raw]) return KNOWN_MESSAGES[raw];
  if (/^Email address ".*" is invalid$/.test(raw)) {
    return "هذا البريد الإلكتروني غير مدعوم، يرجى تجربة بريد آخر";
  }
  if (/rate limit|too many requests/i.test(raw)) {
    return "تم إرسال طلبات كثيرة، يرجى الانتظار قبل طلب رسالة جديدة";
  }
  if (/auth session missing|session.*(?:missing|expired|invalid)/i.test(raw)) {
    return "رابط الاستعادة غير صالح أو منتهي. اطلب رابطًا جديدًا.";
  }
  return "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى";
}
