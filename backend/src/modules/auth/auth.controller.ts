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

    // Actualizar estado a 'online'
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
      maxAge: 24 * 60 * 60 * 1000, // 1 day
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
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return errorResponse(res, 'Username, email, and password are required', 400);
    }

    // Checks for username or email availability in the DB
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse(res, 'User with this email already exists', 400);
      }
      return errorResponse(res, 'Username is already taken', 400);
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'standard_user',
      state: 'online', // Conectado por defecto al registrarse
    });

    const savedUser = await newUser.save();

    // Generates token/cookie
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
    if (req.user?.userId) {
      // Cambiar estado a 'offline' al cerrar sesión
      await User.findByIdAndUpdate(req.user.userId, { state: 'offline' });
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