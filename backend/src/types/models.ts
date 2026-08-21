import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'provider';
  favorites?: Types.ObjectId[];
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryType =
  | 'electrician'
  | 'plumber'
  | 'tutor'
  | 'photographer'
  | 'home_cleaning'
  | 'ac_technician'
  | 'computer_repair';

export type LocationType = 'Hyderabad' | 'Bangalore' | 'Chennai' | 'Mumbai';

export interface IProviderProfile extends Document {
  userId: Types.ObjectId; // Ref to User
  category: CategoryType;
  description: string;
  experience: number;
  location: LocationType;
  price: number;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatusType = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface IBooking extends Document {
  customerId: Types.ObjectId; // Ref to User
  providerId: Types.ObjectId; // Ref to User (not ProviderProfile, so referencing the user account of the provider simplifies security and queries)
  service: string;
  bookingDate: Date;
  preferredTime: string;
  address: string;
  notes?: string;
  status: BookingStatusType;
  createdAt: Date;
  updatedAt: Date;
}
