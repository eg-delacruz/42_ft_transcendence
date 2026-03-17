import { Request, Response, NextFunction } from 'express';

import { User } from '@modules/user/user.model';

import { successResponse, errorResponse } from '@utils/response';

import { hash } from 'bcrypt';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return errorResponse(res, 'Email, password, and role are required', 400);
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 400);
    }

    const hashedPassword = await hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();
    return successResponse(
      res,
      { _id: savedUser._id, email: savedUser.email, role: savedUser.role },
      'User created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({}, '_id email role');

    // Eliminate the user with super_user role from the list
    const filteredUsers = users.filter((user) => user.role !== 'super_user');

    return successResponse(res, filteredUsers, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(
      res,
      {
        _id: deletedUser._id,
        email: deletedUser.email,
        role: deletedUser.role,
      },
      'User deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};
