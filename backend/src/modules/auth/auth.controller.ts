import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '@modules/user/user.model';
import env from '@config/env';
import { successResponse, errorResponse } from '@utils/response';

import { AuthRequest } from '@middlewares/auth.middleware';

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const body = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    };

    return successResponse(res, body, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

// Controller to get current authenticated user's info
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  return successResponse(
    res,
    {
      user: req.user,
    },
    'Authenticated user'
  );
};

export const handleLogout = (req: Request, res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true, // Ensures the cookie is only accessible via HTTP(S), not JavaScript
    secure: env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS in production
    sameSite: 'strict', // Helps prevent CSRF attacks
  });

  return successResponse(res, null, 'Logout successful', 200);
};
