import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { requireRole } from '@middlewares/role.middleware';

// Controller
import { createUser, getAllUsers, deleteUserById } from './user.controller';

const router = Router();

router.post('/create', authMiddleware, requireRole('super_user'), createUser);

router.get('/all', authMiddleware, requireRole('super_user'), getAllUsers);

router.delete(
  '/delete/:id',
  authMiddleware,
  requireRole('super_user'),
  deleteUserById
);

export default router;
