import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { requireRole } from '@middlewares/role.middleware';

// Controller
import { createUser, getAllUsers, deleteUserById } from './user.controller';

const router = Router();

router.post('/create', createUser);

// Consider to require the super_user role to access this route, but for now we will leave it open for testing purposes
router.get('/all', getAllUsers);

router.delete(
  '/delete/:id',
  authMiddleware,
  deleteUserById
);

export default router;
