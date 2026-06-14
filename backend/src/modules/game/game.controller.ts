import { Request, Response, NextFunction } from "express";

import { Game } from "@modules/game/game.model";

import { successResponse, errorResponse } from "@utils/response";

export const updateGameScores = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const game_name = req.params.game_name;
  const { new_score, user_id } = req.body;

  console.log("updateGameScores:", {
    game_name,
    new_score,
    user_id,
  });

  // TODO: Validate the input data (e.g., check if new_score is a number, user_id is a valid ID, etc.)

  try {
    // TODO: Find the game by name

    // TODO: Implement the logic to update the scores of the game for the specific user.

    return successResponse(
      res,
      { message: "Scores updated successfully" },
      "Scores updated successfully",
    );
  } catch (error) {
    next(error);
  }
};
