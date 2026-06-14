import { Router } from "express";

import authRoutes from "@modules/auth/auth.routes";
import userRoutes from "@modules/user/user.routes";
import gameRoutes from "@modules/game/game.routes";

import { User } from "@modules/user/user.model"; //TODO: remove this import when project is ready

export const router = Router();

// // Mount module routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/games", gameRoutes);

// Clear DB
// TODO: erase when project is ready
router.delete("/clear-db", async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: "Database cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing database" });
  }
});

// Test route to verify server is working
router.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});
