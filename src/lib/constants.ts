export const DEFAULT_ACCENT_COLOR = "#6D5EFC";

export const DEFAULT_DISCLAIMER_TEXT = "هذا المحتوى للتوعية فقط ولا يغني عن استشارة الطبيب";

export const PROTECTED_ROUTES = ["/projects", "/settings", "/templates/designer", "/templates/mine"];

export const AUTH_ROUTES = ["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"];

export const AI_DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
export const AI_DEFAULT_MODEL = "deepseek/deepseek-v4-flash";
export const APP_NAME = "Typo AI";

// Selectable in the AI Template Designer's model picker — overrides
// AI_MODEL/AI_DEFAULT_MODEL for that generation only.
export const AVAILABLE_AI_MODELS: { id: string; label: string }[] = [
  { id: "tencent/hy3", label: "Tencent HY3" },
  { id: "deepseek/deepseek-v4-pro", label: "DeepSeek V4 Pro" },
  { id: "xiaomi/mimo-v2.5", label: "Xiaomi MiMo 2.5" },
  { id: "minimax/minimax-m3", label: "MiniMax M3" },
];
