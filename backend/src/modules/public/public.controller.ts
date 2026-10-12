import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

import { Game } from "@modules/game/game.model";
import { successResponse, errorResponse } from "@utils/response";

const SAFE_USER_SELECT = "username display_name avatar_url points";

// Whitelisted public user fields — never emails, password hashes, or roles.
const toSafeUser = (user: any) => {
  if (!user) return null;
  const doc = typeof user.toObject === "function" ? user.toObject() : user;
  return {
    _id: doc._id,
    username: doc.username,
    display_name: doc.display_name,
    avatar_url: doc.avatar_url,
    points: doc.points,
  };
};

const toSafeGame = (game: any) => {
  const doc = typeof game.toObject === "function" ? game.toObject() : game;
  return {
    _id: doc._id,
    name: doc.name,
    top_1_user: toSafeUser(doc.top_1_user),
    top_1_score: doc.top_1_score,
    top_2_user: toSafeUser(doc.top_2_user),
    top_2_score: doc.top_2_score,
    top_3_user: toSafeUser(doc.top_3_user),
    top_3_score: doc.top_3_score,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const VALID_GAME_NAMES = ["fight_fight", "the_race", "deep_&_dark"];

const populateSafe = (query: any) =>
  query.populate({
    path: "top_1_user top_2_user top_3_user",
    select: SAFE_USER_SELECT,
  });

// GET /api/public/games
export const listPublicGames = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const games = await populateSafe(Game.find({})).exec();
    return successResponse(res, games.map(toSafeGame), "Games retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// GET /api/public/games/:game_name
export const getPublicGameByName = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const game = await populateSafe(Game.findOne({ name: req.params.game_name as any })).exec();
    if (!game) {
      return errorResponse(res, "Game not found", 404);
    }
    return successResponse(res, toSafeGame(game), "Game retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// POST /api/public/games
export const createPublicGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, top_1_score, top_2_score, top_3_score } = req.body ?? {};

  if (!name || typeof name !== "string") {
    return errorResponse(res, "name is required and must be a string", 400);
  }
  if (!VALID_GAME_NAMES.includes(name)) {
    return errorResponse(
      res,
      `name must be one of: ${VALID_GAME_NAMES.join(", ")}`,
      400,
    );
  }

  for (const [field, value] of Object.entries({ top_1_score, top_2_score, top_3_score })) {
    if (value !== undefined && (typeof value !== "number" || isNaN(value) || value < 0)) {
      return errorResponse(res, `${field} must be a non-negative number`, 400);
    }
  }

  try {
    const existing = await Game.findOne({ name: name as any }).exec();
    if (existing) {
      return errorResponse(res, "Game already exists", 409);
    }
    const game = await Game.create({
      name: name as any,
      top_1_score: top_1_score ?? 0,
      top_2_score: top_2_score ?? 0,
      top_3_score: top_3_score ?? 0,
    });
    const populated = await populateSafe(Game.findById(game._id)).exec();
    return successResponse(res, toSafeGame(populated), "Game created successfully", 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/public/games/:game_name — same score-submit validators as PATCH /api/games/:game_name.
export const updatePublicGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const game_name = req.params.game_name;
  const { new_score, user_id } = req.body ?? {};

  // Validate inputs (mirrors updateGameScores in game.controller.ts)
  if (typeof new_score !== "number" || isNaN(new_score) || new_score < 0) {
    return errorResponse(res, "new_score must be a non-negative number", 400);
  }
  if (!user_id || typeof user_id !== "string") {
    return errorResponse(res, "user_id is required and must be a string", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    return errorResponse(res, "user_id must be a valid Mongo ObjectId", 400);
  }

  try {
    const game = await Game.findOne({ name: game_name as any });
    if (!game) {
      return errorResponse(res, "Game not found", 404);
    }

    const entries: { id: string; score: number }[] = [];
    if (game.top_1_user)
      entries.push({ id: game.top_1_user.toString(), score: game.top_1_score });
    if (game.top_2_user)
      entries.push({ id: game.top_2_user.toString(), score: game.top_2_score });
    if (game.top_3_user)
      entries.push({ id: game.top_3_user.toString(), score: game.top_3_score });

    const existingIndex = entries.findIndex((e) => e.id === user_id);
    if (existingIndex !== -1) {
      if (new_score > entries[existingIndex].score) {
        entries[existingIndex].score = new_score;
      } else {
        return successResponse(
          res,
          { message: "Score not higher than existing; no update needed" },
          "No update needed",
        );
      }
    } else {
      entries.push({ id: user_id, score: new_score });
    }

    entries.sort((a, b) => b.score - a.score);
    const top3 = entries.slice(0, 3);

    game.top_1_user = top3[0]?.id ? new mongoose.Types.ObjectId(top3[0].id) : null;
    game.top_1_score = top3[0]?.score ?? 0;
    game.top_2_user = top3[1]?.id ? new mongoose.Types.ObjectId(top3[1].id) : null;
    game.top_2_score = top3[1]?.score ?? 0;
    game.top_3_user = top3[2]?.id ? new mongoose.Types.ObjectId(top3[2].id) : null;
    game.top_3_score = top3[2]?.score ?? 0;

    await game.save();

    const populated = await populateSafe(Game.findById(game._id)).exec();
    return successResponse(res, toSafeGame(populated), "Scores updated successfully");
  } catch (error) {
    next(error);
  }
};

// DELETE /api/public/games/:game_name
export const deletePublicGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const game = await Game.findOneAndDelete({ name: req.params.game_name as any }).exec();
    if (!game) {
      return errorResponse(res, "Game not found", 404);
    }
    return successResponse(res, toSafeGame(game), "Game deleted successfully");
  } catch (error) {
    next(error);
  }
};
