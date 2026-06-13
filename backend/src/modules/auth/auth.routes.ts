import { Router } from 'express';

import {
  handleLogin,
  registerUser,
  getCurrentUser,
  handleLogout,
} from '@modules/auth/auth.controller';

import { authMiddleware } from '@middlewares/auth.middleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', handleLogin);

// Protected route to get current authenticated user's info
// If the user is authenticated, the authMiddleware will attach the user info to req.user, which can then be accessed in the getCurrentUser controller.
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, handleLogout);

export default router;
