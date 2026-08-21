import { Router } from 'express';
import {
  getCategories,
  getProviders,
  getProviderDetails,
  getMyProfile,
  upsertProfile,
} from '../controllers/providerController';
import { createReview, getReviews } from '../controllers/reviewController';
import { toggleFavorite, getMyFavorites } from '../controllers/favoriteController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/categories', getCategories);
router.get('/', getProviders);

// Customer favorites route (must be defined before /:id)
router.get('/favorites/me', protect, restrictTo('customer'), getMyFavorites);

// Provider detail route
router.get('/:id', getProviderDetails);

// Reviews routes
router.post('/:id/reviews', protect, restrictTo('customer'), createReview);
router.get('/:id/reviews', getReviews);

// Favorite toggling route
router.post('/:id/favorite', protect, restrictTo('customer'), toggleFavorite);

// Protected routes (Providers only)
router.get('/profile/me', protect, restrictTo('provider'), getMyProfile);
router.put('/profile', protect, restrictTo('provider'), upsertProfile);

export default router;
