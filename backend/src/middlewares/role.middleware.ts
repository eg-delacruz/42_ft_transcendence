import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { errorResponse } from '@utils/response';

//Types
import { UserRole } from '@interfaces/roles';

// Params mean: get all the passed roles and put them in an array called roles
export const requireRole = (...roles: UserRole[]) => {
  if (roles.length === 0) {
    throw new Error('At least one role must be specified');
  }

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(
        res,
        'Not authenticated',
        401,
        'Authentication required'
      );
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return errorResponse(
        res,
        'Forbidden',
        403,
        'User does not have the required role'
      );
    }

    next();
  };
};

/*
Used like the auth.middleware in routes to protect routes based on user roles (see auth.middleware.ts file for an example):

router.post(
  '/users',
  authMiddleware,
  requireRole('super_user', 'admin'),
  createUserController
);

*/
