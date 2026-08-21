import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingDetails,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingDetails);
router.put('/:id/status', updateBookingStatus);
router.delete('/:id', cancelBooking);

export default router;
