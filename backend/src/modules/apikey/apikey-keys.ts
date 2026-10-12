import crypto from "node:crypto";

export type ApiKeyScope = "read" | "write";

export interface ApiKeyPair {
  prefix: string;
  secret: string;
  raw: string;
}

export interface ParsedApiKey {
  prefix: string;
  secret: string;
}

export type ApiKeyUsability = "usable" | "expired" | "revoked";

const PREFIX_BYTES = 6;
const SECRET_BYTES = 32;
const HEADER_PATTERN = /^ft_pk_([0-9a-f]{12})\.([^.]+)$/;

export const generateApiKey = (): ApiKeyPair => {
  const prefix = crypto.randomBytes(PREFIX_BYTES).toString("hex");
  const secret = crypto.randomBytes(SECRET_BYTES).toString("base64url");
  return { prefix, secret, raw: `ft_pk_${prefix}.${secret}` };
};

// Parses the exact `x-api-key` header string only. There is intentionally no
// query-param fallback: callers must pass the header value, nothing else.
export const parseApiKeyHeader = (header: unknown): ParsedApiKey | null => {
  if (typeof header !== "string") return null;
  const match = HEADER_PATTERN.exec(header.trim());
  if (!match) return null;
  const [, prefix, secret] = match;
  if (secret.length === 0) return null;
  return { prefix, secret };
};

// SHA-256(secret + pepper). The pepper is a parameter (default "") so this
// module stays dependency-free; server code passes the env pepper explicitly.
export const hashApiKeySecret = (secret: string, pepper = ""): string => {
  return crypto
    .createHash("sha256")
    .update(`${secret}${pepper}`)
    .digest("hex");
};

export const timingSafeEqualHex = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

export const verifyApiKeySecret = (
  secret: string,
  expectedHash: string,
  pepper = "",
): boolean => {
  return timingSafeEqualHex(hashApiKeySecret(secret, pepper), expectedHash);
};

// Revoked takes precedence so callers can map revoked -> 403 while
// expired -> 401. The two outcomes are intentionally distinct.
export const getApiKeyUsability = (
  key: { revokedAt: Date | null; expiresAt: Date | null },
  now: number = Date.now(),
): ApiKeyUsability => {
  if (key.revokedAt) return "revoked";
  if (key.expiresAt && key.expiresAt.getTime() <= now) return "expired";
  return "usable";
};

// A `write` key implies `read`.
export const hasApiKeyScope = (
  scopes: ApiKeyScope[],
  required: ApiKeyScope,
): boolean => {
  if (required === "read") {
    return scopes.includes("read") || scopes.includes("write");
  }
  return scopes.includes("write");
};
