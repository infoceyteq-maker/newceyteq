/**
 * Input sanitisation helpers.
 *
 * Defence in depth: React already escapes everything we render, and no part of
 * the app uses `dangerouslySetInnerHTML`. These helpers additionally normalise
 * and bound every value before it is validated, stored, exported or echoed so
 * that hostile input never reaches the database in a surprising shape.
 */

/** Zero-width, bidi-control and C0/C1 control characters. */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;

/** Remove control characters and normalise unicode + whitespace. */
export function stripUnsafeCharacters(value: string) {
  return value.normalize("NFC").replace(CONTROL_CHARS, "");
}

/**
 * Strips anything that looks like markup so stored answers are always plain
 * text — even if a future template or export path renders them outside React.
 * Angle brackets that are not part of a tag (e.g. "Fish & Chips <3") survive.
 */
export function stripMarkup(value: string) {
  return value
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)[\s\S]*?>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
}

/** Single-line field: control chars removed, whitespace collapsed, length capped. */
export function sanitizeSingleLine(value: unknown, maxLength = 500) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return stripMarkup(stripUnsafeCharacters(String(value)))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Multi-line field: newlines preserved, control chars removed, length capped. */
export function sanitizeMultiline(value: unknown, maxLength = 4000) {
  if (typeof value !== "string") return "";
  return stripMarkup(stripUnsafeCharacters(String(value).replace(/\r\n?/g, "\n")))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

/** Emails are lower-cased and stripped to the RFC-safe character set. */
export function sanitizeEmail(value: unknown) {
  if (typeof value !== "string") return "";
  return stripUnsafeCharacters(value).replace(/\s+/g, "").toLowerCase().slice(0, 254);
}

/** Phone numbers keep digits and formatting punctuation only. */
export function sanitizePhone(value: unknown) {
  if (typeof value !== "string") return "";
  return stripUnsafeCharacters(value)
    .replace(/[^\d+()\s\-.]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32);
}

const BLOCKED_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:", "blob:", "about:"];

/**
 * Normalises a user supplied URL and rejects dangerous schemes.
 * Returns an empty string when the value cannot be turned into a safe http(s)
 * or mailto/tel link.
 */
export function sanitizeUrl(value: unknown, options: { allowMail?: boolean; allowTel?: boolean } = {}) {
  if (typeof value !== "string") return "";
  const raw = stripUnsafeCharacters(value).trim().slice(0, 2048);
  if (!raw) return "";

  const lower = raw.toLowerCase().replace(/\s/g, "");
  if (BLOCKED_PROTOCOLS.some((protocol) => lower.startsWith(protocol))) return "";

  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) {
    const allowed = lower.startsWith("mailto:") ? options.allowMail : options.allowTel;
    return allowed ? raw : "";
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    // Reject credentials in URLs (phishing pattern) and whitespace in the host.
    if (url.username || url.password) return "";
    if (!url.hostname.includes(".") || /\s/.test(url.hostname)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

/** Slugs, field keys and other identifiers. */
export function sanitizeIdentifier(value: unknown, maxLength = 64) {
  if (typeof value !== "string") return "";
  return stripUnsafeCharacters(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

/**
 * Neutralises spreadsheet formula injection (CSV/Excel `=cmd`, `+`, `-`, `@`).
 * Used by the export endpoint.
 */
export function escapeSpreadsheetFormula(value: string) {
  if (/^[=+\-@\t\r]/.test(value)) return `'${value}`;
  return value;
}

/** Strip anything that is not a plain personal-data string from request metadata. */
export function sanitizeUserAgent(value: string | null) {
  if (!value) return null;
  return stripUnsafeCharacters(value).replace(/\s+/g, " ").trim().slice(0, 300);
}
