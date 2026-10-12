import crypto from "node:crypto";
import mongoose, { Schema, Document, Types } from "mongoose";
import env from "@config/env";

export type ApiKeyScope = "read" | "write";

export interface IApiKey extends Document {
  prefix: string;
  keyHash: string;
  name: string;
  scopes: ApiKeyScope[];
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdBy: Types.ObjectId;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema: Schema<IApiKey> = new Schema(
  {
    prefix: { type: String, required: true, unique: true, index: true },
    keyHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    scopes: {
      type: [String],
      enum: ["read", "write"],
      default: ["read"],
    },
    expiresAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ApiKey = mongoose.model<IApiKey>("ApiKey", apiKeySchema);

// SHA-256(secret + pepper). The pepper is optional and comes from env.
export const hashApiKeySecret = (secret: string): string => {
  return crypto
    .createHash("sha256")
    .update(`${secret}${env.API_KEY_HASH_SECRET}`)
    .digest("hex");
};
