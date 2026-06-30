import { Router } from "express";

import { authMiddleware } from "@middlewares/auth.middleware";
import { requireRole } from "@middlewares/role.middleware";

// Controller
import {
  createUser,
  getAllUsers,
  deleteUserById,
  updateUserById,
} from "./user.controller";

const router = Router();

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Create a new user. Only accessible by super_admin and admin roles.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               role: { type: string, example: "user" }
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "" }
 *                 body:
 *                   type: object
 *                   properties:
 *                     _id: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *                 message: { type: string, example: "User created successfully" }
 *       400:
 *         description: Missing fields or email already exists
 */
router.post(
  "/create",
  authMiddleware,
  requireRole("super_admin", "admin"),
  createUser,
);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users (excludes super_admin). Only accessible by super_admin and admin roles.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "" }
 *                 body:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       email: { type: string }
 *                       role: { type: string }
 *                       avatar_url: { type: string }
 *                       display_name: { type: string }
 *                       points: { type: number }
 *
 *                 message: { type: string, example: "Users retrieved successfully" }
 */
router.get(
  "/all",
  authMiddleware,
  requireRole("super_admin", "admin"),
  getAllUsers,
);

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Delete a user by ID. Only accessible by super_admin, admin, and user roles. Users can delete their own account, while super_admin and admin can delete any user.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "" }
 *                 body:
 *                   type: object
 *                   properties:
 *                     _id: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *                 message: { type: string, example: "User deleted successfully" }
 *       404:
 *         description: User not found
 */
router.delete(
  "/delete/:id",
  authMiddleware,
  requireRole("super_admin", "admin", "user"),
  deleteUserById,
);

/**
 * @swagger
 * /users/update/{id}:
 *   patch:
 *     summary: Partially update a user by ID. Only accessible by super_admin, admin, and user roles. Users can only update their own account; super_admin and admin can update any user.
 *     description: >
 *       Send only the fields you want to change — all body fields are optional.
 *       Missing or omitted fields are left unchanged. An empty body or a body
 *       without any allowed field returns 400.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar_url: { type: string, description: "New avatar URL (optional)" }
 *               display_name: { type: string, description: "New display name (optional)" }
 *               points: { type: number, description: "New points value (optional)" }
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "" }
 *                 body:
 *                   type: object
 *                   properties:
 *                     _id: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *                     avatar_url: { type: string }
 *                     display_name: { type: string }
 *                     points: { type: number }
 *                 message: { type: string, example: "User updated successfully" }
 *       400:
 *         description: No valid fields to update (empty body or no allowed fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "No valid fields to update" }
 *                 body: { type: string, example: "" }
 *                 message: { type: string, example: "" }
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden — user trying to update another user's account
 *       404:
 *         description: User not found
 */
router.patch(
  "/update/:id",
  authMiddleware,
  requireRole("super_admin", "admin", "user"),
  updateUserById,
);

export default router;
