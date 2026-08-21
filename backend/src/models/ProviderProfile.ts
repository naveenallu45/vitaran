import mongoose, { Schema } from 'mongoose';
import { IProviderProfile } from '../types/models';

const ProviderProfileSchema: Schema<IProviderProfile> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'electrician',
        'plumber',
        'tutor',
        'photographer',
        'home_cleaning',
        'ac_technician',
        'computer_repair',
      ],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Experience in years is required'],
      min: [0, 'Experience cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      enum: ['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    profileImage: {
      type: String,
      required: [true, 'Profile image URL is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for search optimization
ProviderProfileSchema.index({ location: 1, category: 1 });

export const ProviderProfile = mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);
export default ProviderProfile;
