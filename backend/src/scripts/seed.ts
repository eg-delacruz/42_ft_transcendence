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
      logger.warn("Supper user already exists, skipping.");
      return;
    } else seedSuperUser();
  } catch (error) {
    logger.error("Seed failed: " + error);
    process.exitCode = 1;
  }
}

async function seedSuperUser() {
  try {
    // Connect to DB to running this script
    logger.info("Running seed script...");

    // Hash super user password
    const hashedPassword = await hash(env.SUPER_PASS, 10);

    // Create the super user in the mongo db
    await User.create({
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

    // Check if games with name fight_fight, the_race and deep_&_dark already exist
    const existingGames = await Game.find({
      name: { $in: ["fight_fight", "the_race", "deep_&_dark"] },
    });

    if (existingGames.length === 3) {
      logger.warn("Games already exist, skipping.");
      return;
    } else seedGames();
  } catch (error) {
    logger.error("Seed failed: " + error);
    process.exitCode = 1;
  }
}

async function seedGames() {
  try {
    logger.info("Running seed script...");

    // Create the games in mongo db
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
