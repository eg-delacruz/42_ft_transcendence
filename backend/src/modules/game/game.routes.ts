import { Router } from "express";

import { authMiddleware } from "@middlewares/auth.middleware";

// Controller
import { updateGameScores } from "./game.controller";

const router = Router();

// TODO: seed the initial games
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
 *         description: Scores updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "" }
 *                 body:
 *                   type: object
 *                   properties:
 *                     message: { type: string, example: "Scores updated successfully" }
 *       400:
 *         description: Missing fields or invalid data
 */
router.patch("/:game_name/scores", authMiddleware, updateGameScores);

export default router;
