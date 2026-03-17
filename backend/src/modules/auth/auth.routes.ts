import { Router } from 'express';
import {
  handleLogin,
  getCurrentUser,
  handleLogout,
} from '@modules/auth/auth.controller';
import { authMiddleware } from '@middlewares/auth.middleware';

const router = Router();

router.post('/login', handleLogin);

// Protected route to get current authenticated user's info
// If the user is not authenticated, authMiddleware will respond with 401 Unauthorized
// authMiddleware adds the user info to req.user
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, handleLogout);

export default router;
