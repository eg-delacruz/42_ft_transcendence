import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateApiKey,
  parseApiKeyHeader,
  hashApiKeySecret,
  verifyApiKeySecret,
  getApiKeyUsability,
  hasApiKeyScope,
} from "./apikey-keys.ts";

describe("apikey-keys contract", () => {
  it("round-trips generate -> parse -> verify", () => {
    const pair = generateApiKey();
    const parsed = parseApiKeyHeader(pair.raw);
    assert.deepStrictEqual(parsed, { prefix: pair.prefix, secret: pair.secret });
    const hash = hashApiKeySecret(pair.secret, "pepper");
    assert.equal(verifyApiKeySecret(pair.secret, hash, "pepper"), true);
  });

  it("rejects missing and malformed headers", () => {
    const bad: unknown[] = [
      undefined, null, "", "   ", "no-dot",
      "sk_abcdef123456.somesecret", "ft_pk_abc.", "ft_pk_abcdef123456.",
      "ft_pk_xyz-not-hex!.secret",
    ];
    for (const header of bad) assert.equal(parseApiKeyHeader(header), null);
  });

  it("rejects wrong secrets and tampered hashes", () => {
    const pair = generateApiKey();
    const hash = hashApiKeySecret(pair.secret);
    assert.equal(verifyApiKeySecret("wrong-secret", hash), false);
    const tampered = (hash[0] === "a" ? "b" : "a") + hash.slice(1);
    assert.equal(verifyApiKeySecret(pair.secret, tampered), false);
  });

  it("distinguishes usable, expired, and revoked keys", () => {
    assert.equal(getApiKeyUsability({ revokedAt: null, expiresAt: null }), "usable");
    assert.equal(
      getApiKeyUsability({ revokedAt: null, expiresAt: new Date(Date.now() + 60_000) }),
      "usable",
    );
    assert.equal(
      getApiKeyUsability({ revokedAt: null, expiresAt: new Date(Date.now() - 1000) }),
      "expired",
    );
    const revoked = getApiKeyUsability({
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() - 1000),
    });
    assert.equal(revoked, "revoked");
    assert.notEqual(revoked, "expired");
  });

  it("grants read to read keys and both to write keys", () => {
    assert.equal(hasApiKeyScope(["read"], "read"), true);
    assert.equal(hasApiKeyScope(["read"], "write"), false);
    assert.equal(hasApiKeyScope(["write"], "read"), true);
    assert.equal(hasApiKeyScope(["write"], "write"), true);
  });
});
