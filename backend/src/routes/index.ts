import { Router } from 'express';

import authRoutes from '@modules/auth/auth.routes';
import userRoutes from '@modules/user/user.routes';

export const router = Router();

// // Mount module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Test route to verify server is working
router.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});
