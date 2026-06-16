import { Router } from "express";

import { authMiddleware } from "@middlewares/auth.middleware";

// Controller
import { updateGameScores, getGameByName } from "./game.controller";

const router = Router();

/**
 * @swagger
 * /games/{game_name}:
 *   get:
 *     summary: Get a game by its name:fight_fight, the_race or deep_&_dark. Only accessible by authenticated users.
 *     tags: [Games]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "" }
 *                 body:
 *                   type: object
 *                   properties:
 *                     name: { type: string, example: "fight_fight" }
 *                     top_1_id: { type: string, example: "user_id_1" }
 *                     top_1_score: { type: number, example: 100 }
 *                     top_2_id: { type: string, example: "user_id_2" }
 *                     top_2_score: { type: number, example: 80 }
 *                     top_3_id: { type: string, example: "user_id_3" }
 *                     top_3_score: { type: number, example: 60 }
 *                     createdAt: { type: string, format: date-time, example: "2024-01-01T00:00:00Z" }
 *                     updatedAt: { type: string, format: date-time, example: "2024-01-02T00:00:00Z" }
 *       404:
 *         description: Game not found
 */
router.get("/:game_name", authMiddleware, getGameByName);

/**
 * @swagger
 * /games/{game_name}/scores:
 *   patch:
 *     summary: Update the scores of a specific game. Only accessible by authenticated users.
 *     tags: [Games]
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
 *         description: Scores updated successfully — returns the updated game leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "" }
 *                 body:
 *                   type: object
 *                   properties:
 *                     name: { type: string, example: "fight_fight" }
 *                     top_1_id: { type: string, example: "user_id_1" }
 *                     top_1_score: { type: number, example: 100 }
 *                     top_2_id: { type: string, example: "user_id_2" }
 *                     top_2_score: { type: number, example: 80 }
 *                     top_3_id: { type: string, example: "user_id_3" }
 *                     top_3_score: { type: number, example: 60 }
 *                     createdAt: { type: string, format: date-time, example: "2024-01-01T00:00:00Z" }
 *                     updatedAt: { type: string, format: date-time, example: "2024-01-02T00:00:00Z" }
 *       400:
 *         description: Missing fields or invalid data
 *       404:
 *         description: Game not found
 */
router.patch("/:game_name", authMiddleware, updateGameScores);

export default router;
