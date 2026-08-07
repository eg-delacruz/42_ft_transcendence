import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '@modules/user/user.model';
import env from '@config/env';
import { successResponse, errorResponse } from '@utils/response';

import { AuthRequest } from '@middlewares/auth.middleware';

// Login user
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

    user.state = 'online';
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const body = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        points: user.points,
        state: user.state,
        stats: user.stats,
        role: user.role,
      },
    };

    return successResponse(res, body, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

// Register a user into the db
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { username, email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Autogenera un username basado en el correo si no viene especificado
    if (!username) {
      username = email.split('@')[0];
    }

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse(res, 'User with this email already exists', 400);
      }
      return errorResponse(res, 'Username is already taken', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Corregido: se asigna 'user' acorde con el enum del modelo
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      state: 'online',
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { userId: savedUser._id, role: savedUser.role, email: savedUser.email },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const body = {
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        avatarUrl: savedUser.avatarUrl,
        points: savedUser.points,
        state: savedUser.state,
        stats: savedUser.stats,
        role: savedUser.role,
      },
    };

    return successResponse(res, body, 'User registered successfully', 201);
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

// Logout user
export const handleLogout = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userPayload = req.user as any;
    const currentUserId = userPayload?.userId || userPayload?.id || userPayload?._id;

    if (currentUserId) {
      await User.findByIdAndUpdate(currentUserId, { state: 'offline' });
    }

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return successResponse(res, null, 'Logout successful', 200);
  } catch (error) {
    next(error);
  }
};