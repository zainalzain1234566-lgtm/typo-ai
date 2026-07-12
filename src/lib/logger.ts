// ponytail: zero-dep logger, replace with pino/winston if structured logs needed at scale

const COLORS = {
  AUTH: "\x1b[35m",      // magenta
  PROJECT: "\x1b[36m",   // cyan
  SLIDE: "\x1b[34m",     // blue
  EXPORT: "\x1b[32m",   // green
  SETTINGS: "\x1b[33m", // yellow
  TELEGRAM: "\x1b[94m", // bright blue
  CUSTOM_TEMPLATE: "\x1b[95m", // bright magenta
  MW: "\x1b[90m",        // gray
  ERROR: "\x1b[31m",     // red
  RESET: "\x1b[0m",
};

type LogTag = keyof typeof COLORS;

function ts(): string {
  return new Date().toISOString().split("T")[1].replace("Z", "");
}

function fmt(tag: LogTag, msg: string, meta?: unknown): string {
  const color = COLORS[tag] ?? "";
  const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
  return `${color}[${ts()}] ${tag.padEnd(8)}${COLORS.RESET} ${msg}${metaStr}`;
}

export function log(tag: LogTag, msg: string, meta?: unknown): void {
  if (process.env.NODE_ENV === "production" && tag !== "ERROR") return;
  console.log(fmt(tag, msg, meta));
}

export function logError(tag: LogTag, msg: string, err?: unknown): void {
  const errStr = err instanceof Error ? `${err.message}` : err !== undefined ? JSON.stringify(err) : "";
  console.error(fmt("ERROR", `[${tag}] ${msg}${errStr ? " — " + errStr : ""}`));
}
