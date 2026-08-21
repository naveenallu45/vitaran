import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'provider'], {
    errorMap: () => ({ message: "Role must be either 'customer' or 'provider'" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const providerProfileSchema = z.object({
  category: z.enum(
    [
      'electrician',
      'plumber',
      'tutor',
      'photographer',
      'home_cleaning',
      'ac_technician',
      'computer_repair',
    ],
    { errorMap: () => ({ message: 'Invalid category' }) }
  ),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  experience: z.number().min(0, 'Experience must be 0 or more years'),
  location: z.enum(['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai'], {
    errorMap: () => ({ message: 'Invalid location' }),
  }),
  price: z.number().min(0, 'Price cannot be negative'),
  profileImage: z.string().url('Invalid profile image URL'),
});

export const bookingSchema = z.object({
  providerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Provider User ID'),
  service: z.string().min(2, 'Service description must be at least 2 characters'),
  bookingDate: z.string().refine((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) return false;
    
    // Ensure booking date is not in the past (allow today onwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date >= today;
  }, { message: 'Booking date must be today or in the future' }),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status type' }),
  }),
});
