// Models
import { User } from "@modules/user/user.model";
import { Game } from "@modules/game/game.model";

import "dotenv/config";
import env from "@config/env";
import { logger } from "@config/logger";
import { hash } from "bcrypt";

export async function ensureSuperUser() {
  try {
    logger.info("Running ensureSuperUser script...");

    // Checks if super user / exisiting user is already created
    const existingUser = await User.findOne({ email: env.SUPER_EMAIL });
    if (existingUser) {
      logger.warn("Super user already exists, skipping.");
      return;
    } else await seedSuperUser();
  } catch (error) {
    logger.error("Seed failed: " + error);
    process.exitCode = 1;
  }
}

async function seedSuperUser() {
  try {
    logger.info("Running seed script...");

    const hashedPassword = await hash(env.SUPER_PASS, 10);

    // Se añade 'username' obligatorio para cumplir con user.model.ts
    await User.create({
      username: process.env.SUPER_USERNAME || "admin",
      email: env.SUPER_EMAIL,
      password: hashedPassword,
      role: "super_admin",
    });

    logger.info("Super user created successfully.");
  } catch (error) {
    logger.error("Seed failed: " + error);
    process.exitCode = 1;
  }
}

export async function ensureGames() {
  try {
    logger.info("Running ensureGames script...");

    const existingGames = await Game.find({
      name: { $in: ["fight_fight", "the_race", "deep_&_dark"] },
    });

    if (existingGames.length === 3) {
      logger.warn("Games already exist, skipping.");
      return;
    } else await seedGames();
  } catch (error) {
    logger.error("Seed failed: " + error);
    process.exitCode = 1;
  }
}

async function seedGames() {
  try {
    logger.info("Running seed script...");

    await Game.create([
      { name: "fight_fight" },
      { name: "the_race" },
      { name: "deep_&_dark" },
    ]);

    logger.info("Games created successfully.");
  } catch (error) {
    logger.error("Seed failed: " + error);
    process.exitCode = 1;
  }
}