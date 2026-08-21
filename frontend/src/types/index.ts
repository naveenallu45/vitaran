export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'provider';
  favorites?: string[];
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

export interface ProviderProfile {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  category: CategoryType;
  description: string;
  experience: number;
  location: LocationType;
  price: number;
  profileImage: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatusType = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface Booking {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  providerId: {
    _id: string;
    name: string;
    email: string;
  };
  service: string;
  bookingDate: string;
  preferredTime: string;
  address: string;
  notes?: string;
  status: BookingStatusType;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  customerId: {
    _id: string;
    name: string;
  };
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}
