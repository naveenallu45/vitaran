import { Router } from 'express';
import authRoutes from './authRoutes';
import providerRoutes from './providerRoutes';
import bookingRoutes from './bookingRoutes';
import { uploadImage } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/providers', providerRoutes);
router.use('/bookings', bookingRoutes);
router.post('/upload', protect, uploadImage);

export default router;
