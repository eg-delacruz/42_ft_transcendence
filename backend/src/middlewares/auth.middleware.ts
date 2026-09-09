import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "@config/env";
import { errorResponse } from "@utils/response";

export interface AuthPayload {
  userId: string;
  id?: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return errorResponse(res, "Not authenticated", 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as Partial<AuthPayload>;

    if (!decoded?.userId && !decoded?.id) {
      return errorResponse(res, "Invalid token payload", 401);
    }

    req.user = {
      userId: decoded.userId ?? decoded.id!,
      id: decoded.id ?? decoded.userId,
      email: decoded.email ?? "",
      role: decoded.role ?? "",
    };

    next();
  } catch (err) {
    return errorResponse(res, "Invalid or expired token", 401);
  }
};
