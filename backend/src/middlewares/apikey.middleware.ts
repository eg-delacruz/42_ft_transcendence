import crypto from "node:crypto";
import { Request, Response, NextFunction } from "express";
import { ApiKey, hashApiKeySecret, ApiKeyScope } from "@modules/apikey/apikey.model";
import { errorResponse } from "@utils/response";

export interface ApiKeyAuthInfo {
  id: string;
  name: string;
  scopes: ApiKeyScope[];
}

export interface ApiKeyRequest extends Request {
  apiKey?: ApiKeyAuthInfo;
}

const timingSafeEqualHex = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

export const apiKeyAuthMiddleware = async (
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction,
) => {
  // Exact `x-api-key` header only — never accept keys from query params.
  const header = req.headers["x-api-key"];
  const raw = Array.isArray(header) ? header[0] : header;

  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    return errorResponse(res, "Missing API key", 401);
  }

  // Expected format: ft_pk_<prefix>.<secret>
  const match = /^ft_pk_([0-9a-f]{12})\.([^.]+)$/.exec(raw.trim());
  if (!match) {
    return errorResponse(res, "Invalid API key", 401);
  }
  const [, prefix, secret] = match;

  try {
    const record = await ApiKey.findOne({ prefix }).exec();
    if (!record) {
      return errorResponse(res, "Invalid API key", 401);
    }

    const computed = hashApiKeySecret(secret);
    if (!timingSafeEqualHex(record.keyHash, computed)) {
      return errorResponse(res, "Invalid API key", 401);
    }

    if (record.revokedAt) {
      return errorResponse(res, "API key revoked", 403);
    }

    if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
      return errorResponse(res, "API key expired", 401);
    }

    req.apiKey = {
      id: record._id.toString(),
      name: record.name,
      scopes: record.scopes,
    };

    // Fire-and-forget: never block the request on bookkeeping.
    ApiKey.updateOne(
      { _id: record._id },
      { $set: { lastUsedAt: new Date() } },
    )
      .exec()
      .catch(() => {});

    next();
  } catch (error) {
    next(error);
  }
};

export const requireApiScope = (scope: ApiKeyScope) => {
  return (req: ApiKeyRequest, res: Response, next: NextFunction) => {
    const scopes = req.apiKey?.scopes ?? [];
    // A `write` key implies `read`.
    if (scope === "read" && (scopes.includes("read") || scopes.includes("write"))) {
      return next();
    }
    if (scope === "write" && scopes.includes("write")) {
      return next();
    }
    return errorResponse(res, "Forbidden", 403);
  };
};
