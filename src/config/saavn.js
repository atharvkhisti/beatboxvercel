const DEFAULT_SAAVN_BASE = "https://beatbox-khaki.vercel.app";

const normalizeBase = (raw) => {
  if (!raw || typeof raw !== "string") return DEFAULT_SAAVN_BASE;

  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_SAAVN_BASE;

  // If someone accidentally leaves the old saavn.dev URL in env, fall back to our deployed proxy.
  if (trimmed.includes("saavn.dev")) {
    return DEFAULT_SAAVN_BASE;
  }

  // Remove trailing slash to avoid double slashes when composing endpoints.
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

export const SAAVN_API_BASE = normalizeBase(process.env.NEXT_PUBLIC_SAAVN_API);
