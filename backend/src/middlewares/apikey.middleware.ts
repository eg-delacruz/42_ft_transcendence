import { Request, Response, NextFunction } from "express";
import { ApiKey, hashApiKeySecret, type ApiKeyScope } from "@modules/apikey/apikey.model";
import { parseApiKeyHeader, timingSafeEqualHex, getApiKeyUsability, hasApiKeyScope } from "@modules/apikey/apikey-keys";
import { errorResponse } from "@utils/response";

export interface ApiKeyAuthInfo {
  id: string;
  name: string;
  scopes: ApiKeyScope[];
}

export interface ApiKeyRequest extends Request {
  apiKey?: ApiKeyAuthInfo;
}

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
  const parsed = parseApiKeyHeader(raw);
  if (!parsed) {
    return errorResponse(res, "Invalid API key", 401);
  }
  const { prefix, secret } = parsed;

  try {
    const record = await ApiKey.findOne({ prefix }).exec();
    if (!record) {
      return errorResponse(res, "Invalid API key", 401);
    }

    const computed = hashApiKeySecret(secret);
    if (!timingSafeEqualHex(record.keyHash, computed)) {
      return errorResponse(res, "Invalid API key", 401);
    }

    const usability = getApiKeyUsability(record);
    if (usability === "revoked") {
      return errorResponse(res, "API key revoked", 403);
    }

    if (usability === "expired") {
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
    // A `write` key implies `read` (see hasApiKeyScope).
    if (hasApiKeyScope(scopes, scope)) {
      return next();
    }
    return errorResponse(res, "Forbidden", 403);
  };
};
