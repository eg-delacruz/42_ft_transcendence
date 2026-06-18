import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

import { Game } from "@modules/game/game.model";

import { successResponse, errorResponse } from "@utils/response";

export const getGameByName = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const game_name = req.params.game_name;

  try {
    const game = await Game.findOne({ name: game_name })
      .populate({
        path: "top_1_user top_2_user top_3_user",
        select: "email display_name avatar_url points",
      });

    if (!game) {
      return errorResponse(res, "Game not found", 404);
    }

    return successResponse(res, game, "Game retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateGameScores = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const game_name = req.params.game_name;
  const { new_score, user_id } = req.body;

  // Validate inputs
  if (typeof new_score !== "number" || isNaN(new_score) || new_score < 0) {
    return errorResponse(res, "new_score must be a non-negative number", 400);
  }
  if (!user_id || typeof user_id !== "string") {
    return errorResponse(res, "user_id is required and must be a string", 400);
  }

  try {
    const game = await Game.findOne({ name: game_name });

    if (!game) {
      return errorResponse(res, "Game not found", 404);
    }

    // Build current leaderboard entries (filter out empty slots)
    const entries: { id: string; score: number }[] = [];
    if (game.top_1_user)
      entries.push({ id: game.top_1_user.toString(), score: game.top_1_score });
    if (game.top_2_user)
      entries.push({ id: game.top_2_user.toString(), score: game.top_2_score });
    if (game.top_3_user)
      entries.push({ id: game.top_3_user.toString(), score: game.top_3_score });

    // Check if this user already has an entry
    const existingIndex = entries.findIndex((e) => e.id === user_id);

    if (existingIndex !== -1) {
      // User already on the leaderboard — only update if new score is better
      if (new_score > entries[existingIndex].score) {
        entries[existingIndex].score = new_score;
      } else {
        // New score isn't better; no change needed
        return successResponse(
          res,
          { message: "Score not higher than existing; no update needed" },
          "No update needed",
        );
      }
    } else {
      // New user — add to entries
      entries.push({ id: user_id, score: new_score });
    }

    // Sort descending by score and take top 3
    entries.sort((a, b) => b.score - a.score);
    const top3 = entries.slice(0, 3);

    // Map back to model fields. Pad with null/0 for empty slots.
    game.top_1_user = top3[0]?.id ? new mongoose.Types.ObjectId(top3[0].id) : null;
    game.top_1_score = top3[0]?.score ?? 0;
    game.top_2_user = top3[1]?.id ? new mongoose.Types.ObjectId(top3[1].id) : null;
    game.top_2_score = top3[1]?.score ?? 0;
    game.top_3_user = top3[2]?.id ? new mongoose.Types.ObjectId(top3[2].id) : null;
    game.top_3_score = top3[2]?.score ?? 0;

    await game.save();

    // Re-fetch with populated users for the response
    const populated = await Game.findById(game._id)
      .populate({
        path: "top_1_user top_2_user top_3_user",
        select: "email display_name avatar_url points",
      });

    return successResponse(res, populated, "Scores updated successfully");
  } catch (error) {
    next(error);
  }
};
