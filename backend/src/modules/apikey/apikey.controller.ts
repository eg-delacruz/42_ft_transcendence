import crypto from "node:crypto";
import { Response, NextFunction } from "express";
import { AuthRequest } from "@middlewares/auth.middleware";
import { ApiKey, hashApiKeySecret, ApiKeyScope } from "./apikey.model";
import { successResponse, errorResponse } from "@utils/response";

const VALID_SCOPES: ApiKeyScope[] = ["read", "write"];

const toMetadata = (record: any) => ({
  id: record._id.toString(),
  prefix: record.prefix,
  name: record.name,
  scopes: record.scopes,
  expiresAt: record.expiresAt ?? null,
  revokedAt: record.revokedAt ?? null,
  lastUsedAt: record.lastUsedAt ?? null,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

// POST /api/api-keys — cookie auth + admin role only (see apikey.routes.ts).
// Returns the plaintext key ONCE; it is never stored and never returned again.
export const createApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { name, scopes, expiresAt } = req.body ?? {};

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return errorResponse(res, "name is required and must be a non-empty string", 400);
  }

  const normalizedScopes: ApiKeyScope[] =
    Array.isArray(scopes) && scopes.length > 0 ? scopes : ["read"];
  if (!normalizedScopes.every((s) => VALID_SCOPES.includes(s))) {
    return errorResponse(res, "scopes must be a subset of ['read', 'write']", 400);
  }

  let expires: Date | null = null;
  if (expiresAt !== undefined && expiresAt !== null) {
    expires = new Date(expiresAt);
    if (isNaN(expires.getTime())) {
      return errorResponse(res, "expiresAt must be a valid date", 400);
    }
  }

  try {
    const creatorId = req.user?.userId ?? (req.user as any)?.id;
    if (!creatorId) {
      return errorResponse(res, "Not authenticated", 401);
    }

    const prefix = crypto.randomBytes(6).toString("hex");
    const secret = crypto.randomBytes(32).toString("base64url");
    const keyHash = hashApiKeySecret(secret);

    const record = await ApiKey.create({
      prefix,
      keyHash,
      name: name.trim(),
      scopes: normalizedScopes,
      expiresAt: expires,
      createdBy: creatorId,
    });

    return successResponse(
      res,
      {
        apiKey: `ft_pk_${prefix}.${secret}`,
        ...toMetadata(record),
      },
      "API key created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/api-keys — metadata only, never hashes or secrets.
export const listApiKeys = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const records = await ApiKey.find().select("-keyHash").lean().exec();
    return successResponse(res, records.map(toMetadata), "API keys retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// POST /api/api-keys/:id/revoke
export const revokeApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const record = await ApiKey.findByIdAndUpdate(
      req.params.id,
      { $set: { revokedAt: new Date() } },
      { new: true },
    )
      .select("-keyHash")
      .lean()
      .exec();
    if (!record) {
      return errorResponse(res, "API key not found", 404);
    }
    return successResponse(res, toMetadata(record), "API key revoked successfully");
  } catch (error) {
    next(error);
  }
};

// DELETE /api/api-keys/:id
export const deleteApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const record = await ApiKey.findByIdAndDelete(req.params.id)
      .select("-keyHash")
      .lean()
      .exec();
    if (!record) {
      return errorResponse(res, "API key not found", 404);
    }
    return successResponse(res, toMetadata(record), "API key deleted successfully");
  } catch (error) {
    next(error);
  }
};
