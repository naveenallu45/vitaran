import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Booking } from '../models/Booking';

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: providerId } = req.params;
    const { rating, comment } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const customerId = req.user.id;

    // 1. Verify if the customer has a completed booking with this provider
    const completedBooking = await Booking.findOne({
      customerId,
      providerId,
      status: 'completed',
    });

    if (!completedBooking) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only review providers who have completed a booking request for you.',
      });
      return;
    }

    // 2. Check if a review already exists
    const existingReview = await Review.findOne({ customerId, providerId });
    if (existingReview) {
      res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this provider.',
      });
      return;
    }

    // 3. Create the review
    const review = new Review({
      customerId,
      providerId,
      rating: Number(rating),
      comment,
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: providerId } = req.params;
    const reviews = await Review.find({ providerId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}
