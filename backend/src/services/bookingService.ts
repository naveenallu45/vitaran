import { Booking } from '../models/Booking';
import { IBooking, BookingStatusType } from '../types/models';
import { User } from '../models/User';

export async function createBooking(data: Partial<IBooking>): Promise<IBooking> {
  const conflict = await Booking.findOne({
    providerId: data.providerId,
    bookingDate: data.bookingDate,
    preferredTime: data.preferredTime,
    status: { $in: ['accepted', 'pending'] },
  });

  if (conflict) {
    throw new Error('This time slot is already booked or has a pending request with this provider.');
  }

  const booking = new Booking(data);
  return booking.save();
}

export async function getBookingsForUser(
  userId: string,
  role: 'customer' | 'provider'
): Promise<IBooking[]> {
  const query = role === 'customer' ? { customerId: userId } : { providerId: userId };
  
  return Booking.find(query)
    .populate('customerId', 'name email')
    .populate('providerId', 'name email')
    .sort({ createdAt: -1 });
}

export async function getBookingById(id: string): Promise<IBooking | null> {
  return Booking.findById(id)
    .populate('customerId', 'name email')
    .populate('providerId', 'name email');
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatusType,
  userId: string,
  role: 'customer' | 'provider'
): Promise<{ success: boolean; message: string; booking?: IBooking }> {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return { success: false, message: 'Booking not found' };
  }

  // Enforce ownership:
  if (role === 'customer' && booking.customerId.toString() !== userId) {
    return { success: false, message: 'Forbidden: You do not own this booking' };
  }
  if (role === 'provider' && booking.providerId.toString() !== userId) {
    return { success: false, message: 'Forbidden: This booking is not assigned to you' };
  }

  const currentStatus = booking.status;

  // Validate state machine transitions
  const validTransitions: Record<BookingStatusType, BookingStatusType[]> = {
    pending: ['accepted', 'rejected', 'cancelled'],
    accepted: ['completed', 'cancelled'],
    rejected: [],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[currentStatus].includes(newStatus)) {
    return {
      success: false,
      message: `Invalid state transition: Cannot change status from '${currentStatus}' to '${newStatus}'`,
    };
  }

  // Enforce role actions:
  if (newStatus === 'accepted' || newStatus === 'rejected' || newStatus === 'completed') {
    if (role !== 'provider') {
      return {
        success: false,
        message: 'Forbidden: Only service providers can accept, reject, or complete booking requests',
      };
    }
  }

  if (newStatus === 'cancelled') {
    // Both customer and provider can cancel pending or accepted bookings
    // Customer cannot cancel completed, rejected or cancelled bookings (which is naturally prevented by the transition map above)
  }

  booking.status = newStatus;
  await booking.save();

  const updatedBooking = await Booking.findById(bookingId)
    .populate('customerId', 'name email')
    .populate('providerId', 'name email');

  return {
    success: true,
    message: `Booking status updated to ${newStatus}`,
    booking: updatedBooking as IBooking,
  };
}
