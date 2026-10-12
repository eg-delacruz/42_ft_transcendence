import { Router } from "express";

import { authMiddleware } from "@middlewares/auth.middleware";
import { requireRole } from "@middlewares/role.middleware";

import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  deleteApiKey,
} from "./apikey.controller";

const router = Router();

// NOTE: key management uses cookie-JWT auth + admin role ONLY.
// The `x-api-key` middleware must never be mounted here.

/**
 * @swagger
 * /api-keys:
 *   post:
 *     summary: Issue a new API key. Admin only (cookie auth). The plaintext key is returned ONCE. Keys expire 24h after issuance (server-set, not client-configurable).
 *     tags: [ApiKeys]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "evaluator-client" }
 *               scopes: { type: array, items: { type: string, enum: [read, write] }, example: ["read"] }
 *     responses:
 *       201:
 *         description: API key created — plaintext secret included only in this response; expires 24h after issuance
 *       400:
 *         description: Invalid name or scopes
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden — admin role required
 */
router.post("/", authMiddleware, requireRole("admin", "super_admin"), createApiKey);

/**
 * @swagger
 * /api-keys:
 *   get:
 *     summary: List API key metadata (never hashes or secrets). Admin only (cookie auth).
 *     tags: [ApiKeys]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: API key metadata list
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden — admin role required
 */
router.get("/", authMiddleware, requireRole("admin", "super_admin"), listApiKeys);

/**
 * @swagger
 * /api-keys/{id}/revoke:
 *   post:
 *     summary: Revoke an API key by ID. Admin only (cookie auth).
 *     tags: [ApiKeys]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID to revoke
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       404:
 *         description: API key not found
 */
router.post("/:id/revoke", authMiddleware, requireRole("admin", "super_admin"), revokeApiKey);

/**
 * @swagger
 * /api-keys/{id}:
 *   delete:
 *     summary: Delete an API key by ID. Admin only (cookie auth).
 *     tags: [ApiKeys]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID to delete
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *       404:
 *         description: API key not found
 */
router.delete("/:id", authMiddleware, requireRole("admin", "super_admin"), deleteApiKey);

export default router;
