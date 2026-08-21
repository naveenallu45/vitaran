import { Request, Response, NextFunction } from 'express';
import { bookingSchema, updateBookingStatusSchema } from '../validators/schemas';
import * as bookingService from '../services/bookingService';
import { User } from '../models/User';

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'customer') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Only customers can book services',
      });
      return;
    }

    const parseResult = bookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
      });
      return;
    }

    const { providerId, service, bookingDate, preferredTime, address, notes } = parseResult.data;

    // Rule: Providers cannot create bookings for themselves
    if (providerId === req.user.id) {
      res.status(400).json({
        success: false,
        message: 'Booking failed',
        errors: ['Providers cannot book services for themselves'],
      });
      return;
    }

    // Verify provider exists and is indeed a provider
    const providerUser = await User.findById(providerId);
    if (!providerUser || providerUser.role !== 'provider') {
      res.status(404).json({
        success: false,
        message: 'Booking failed',
        errors: ['Selected provider does not exist'],
      });
      return;
    }

    const booking = await bookingService.createBooking({
      customerId: req.user.id as any,
      providerId: providerId as any,
      service,
      bookingDate: new Date(bookingDate),
      preferredTime,
      address,
      notes,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const bookings = await bookingService.getBookingsForUser(req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookingDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({ success: false, message: 'Invalid booking ID format' });
      return;
    }

    const booking = await bookingService.getBookingById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Verify ownership
    if (!req.user || 
        (req.user.role === 'customer' && booking.customerId._id.toString() !== req.user.id) ||
        (req.user.role === 'provider' && booking.providerId._id.toString() !== req.user.id)) {
      res.status(403).json({ success: false, message: 'Forbidden: Access denied to this booking' });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({ success: false, message: 'Invalid booking ID format' });
      return;
    }

    const parseResult = updateBookingStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const result = await bookingService.updateBookingStatus(
      id,
      parseResult.data.status,
      req.user.id,
      req.user.role
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({ success: false, message: 'Invalid booking ID format' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const result = await bookingService.updateBookingStatus(
      id,
      'cancelled',
      req.user.id,
      req.user.role
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: result.booking,
    });
  } catch (error) {
    next(error);
  }
}
