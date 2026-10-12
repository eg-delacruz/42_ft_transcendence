import { Router } from "express";

import authRoutes from "@modules/auth/auth.routes";
import userRoutes from "@modules/user/user.routes";
import gameRoutes from "@modules/game/game.routes";
import apiKeyRoutes from "@modules/apikey/apikey.routes";
import publicRoutes from "@modules/public/public.routes";

export const router = Router();

// // Mount module routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/games", gameRoutes);
router.use("/api-keys", apiKeyRoutes);
router.use("/public", publicRoutes);

// Test route to verify server is working
router.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});
