import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "@modules/user/user.model";
import env from "@config/env";
import { successResponse, errorResponse } from "@utils/response";

import { AuthRequest } from "@middlewares/auth.middleware";

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const cleanedUser = {
      id: user._id,
      email: user.email,
      role: user.role,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      avatar_url: user.avatar_url,
      display_name: user.display_name,
      points: user.points,
    };

    const token = jwt.sign(cleanedUser, env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const body = {
      user: cleanedUser,
    };

    return successResponse(res, body, "Login successful", 200);
  } catch (error) {
    next(error);
  }
};

// Register a user into the db
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //  Checks for email and password availability in the petition
    const { email, password } = req.body;
    if (!email || !password)
      return errorResponse(res, "Email and password are required", 400);

    //  Checks for user already exists in the db
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return errorResponse(res, "User with this email already exists", 400);

    //  Hash password and create user with default role
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: in the future update the correct avatar_url, and display_name
    const newUser = new User({
      email,
      password: hashedPassword,
      role: "user",
      avatar_url: "",
      display_name: "",
      points: 0,
    });

    const savedUser = await newUser.save();

    const cleanedUser = {
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role,
      created_at: savedUser.createdAt,
      updated_at: savedUser.updatedAt,
      avatar_url: savedUser.avatar_url,
      display_name: savedUser.display_name,
      points: savedUser.points,
    };

    //  Generates token/cookie and adapt to savedUser
    const token = jwt.sign(cleanedUser, env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day of duration
    });

    const body = {
      user: cleanedUser,
    };

    return successResponse(res, body, "User registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

// Controller to get current authenticated user's info
// This route is protected by authMiddleware, which ensures the user is authenticated and only sends what is in the token sent by the client. The user info is attached to req.user by the authMiddleware.
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, "Not authenticated", 401);
    }

    const dbUser = await User.findById(req.user.id)
      .select("_id email role avatar_url display_name points createdAt updatedAt")
      .lean();

    if (!dbUser) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(
      res,
      { user: dbUser },
      "Authenticated user",
    );
  } catch (error) {
    return errorResponse(res, "Failed to load user", 500);
  }
};

export const handleLogout = (req: Request, res: Response) => {
  res.clearCookie("access_token", {
    httpOnly: true, // Ensures the cookie is only accessible via HTTP(S), not JavaScript
    secure: env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
    sameSite: "strict", // Helps prevent CSRF attacks
  });

  return successResponse(res, null, "Logout successful", 200);
};
