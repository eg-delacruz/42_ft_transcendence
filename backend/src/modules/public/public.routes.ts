import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  apiKeyAuthMiddleware,
  requireApiScope,
} from "@middlewares/apikey.middleware";

import {
  listPublicGames,
  getPublicGameByName,
  createPublicGame,
  updatePublicGame,
  deletePublicGame,
} from "./public.controller";

const router = Router();

// 100 requests per 15 minutes per IP on the public namespace.
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests", body: "", message: "Too many requests" },
});

router.use(publicRateLimiter);

// No JWT cookie is accepted here — only `x-api-key`.
router.use(apiKeyAuthMiddleware);

/**
 * @swagger
 * /public/games:
 *   get:
 *     summary: List all games (public leaderboard fields only, no PII). Requires an API key with `read` scope.
 *     tags: [Public]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Games retrieved successfully
 *       401:
 *         description: Missing, invalid, or expired API key
 *       403:
 *         description: Revoked key or insufficient scope
 *       429:
 *         description: Too many requests
 */
router.get("/games", requireApiScope("read"), listPublicGames);

/**
 * @swagger
 * /public/games/{game_name}:
 *   get:
 *     summary: Get one game by name (public fields only, no PII). Requires an API key with `read` scope.
 *     tags: [Public]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: game_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the game to retrieve.
 *     responses:
 *       200:
 *         description: Game retrieved successfully
 *       401:
 *         description: Missing, invalid, or expired API key
 *       403:
 *         description: Revoked key or insufficient scope
 *       404:
 *         description: Game not found
 *       429:
 *         description: Too many requests
 */
router.get("/games/:game_name", requireApiScope("read"), getPublicGameByName);

/**
 * @swagger
 * /public/games:
 *   post:
 *     summary: Create a game. Requires an API key with `write` scope.
 *     tags: [Public]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "fight_fight" }
 *               top_1_score: { type: number, example: 0 }
 *               top_2_score: { type: number, example: 0 }
 *               top_3_score: { type: number, example: 0 }
 *     responses:
 *       201:
 *         description: Game created successfully
 *       400:
 *         description: Invalid name or scores
 *       401:
 *         description: Missing, invalid, or expired API key
 *       403:
 *         description: Revoked key or insufficient scope
 *       409:
 *         description: Game already exists
 *       429:
 *         description: Too many requests
 */
router.post("/games", requireApiScope("write"), createPublicGame);

/**
 * @swagger
 * /public/games/{game_name}:
 *   put:
 *     summary: Submit a score to a game's leaderboard. Requires an API key with `write` scope.
 *     tags: [Public]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: game_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the game to update scores for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [new_score, user_id]
 *             properties:
 *               new_score: { type: number }
 *               user_id: { type: string }
 *     responses:
 *       200:
 *         description: Scores updated successfully — returns the updated game leaderboard (no PII)
 *       400:
 *         description: Missing fields or invalid data
 *       401:
 *         description: Missing, invalid, or expired API key
 *       403:
 *         description: Revoked key or insufficient scope
 *       404:
 *         description: Game not found
 *       429:
 *         description: Too many requests
 */
router.put("/games/:game_name", requireApiScope("write"), updatePublicGame);

/**
 * @swagger
 * /public/games/{game_name}:
 *   delete:
 *     summary: Delete a game by name. Requires an API key with `write` scope.
 *     tags: [Public]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: game_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the game to delete.
 *     responses:
 *       200:
 *         description: Game deleted successfully
 *       401:
 *         description: Missing, invalid, or expired API key
 *       403:
 *         description: Revoked key or insufficient scope
 *       404:
 *         description: Game not found
 *       429:
 *         description: Too many requests
 */
router.delete("/games/:game_name", requireApiScope("write"), deletePublicGame);

export default router;
