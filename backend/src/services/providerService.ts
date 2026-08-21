import mongoose from 'mongoose';
import { ProviderProfile } from '../models/ProviderProfile';
import { IProviderProfile } from '../types/models';

interface QueryFilters {
  search?: string;
  category?: string;
  location?: string;
  priceRange?: string; // e.g. "below_500", "500_1000", "above_1000"
}

export async function getProviderByUserId(userId: string): Promise<any | null> {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const result = await ProviderProfile.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId',
      },
    },
    { $unwind: '$userId' },
    {
      $lookup: {
        from: 'reviews',
        localField: 'userId._id',
        foreignField: 'providerId',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: {
          $ifNull: [{ $round: [{ $avg: '$reviews.rating' }, 1] }, 0],
        },
        totalReviews: { $size: '$reviews' },
      },
    },
    {
      $project: {
        reviews: 0,
        'userId.password': 0,
      },
    },
  ]);

  return result[0] || null;
}

export async function getProviderById(profileId: string): Promise<any | null> {
  if (!mongoose.Types.ObjectId.isValid(profileId)) return null;

  const result = await ProviderProfile.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(profileId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId',
      },
    },
    { $unwind: '$userId' },
    {
      $lookup: {
        from: 'reviews',
        localField: 'userId._id',
        foreignField: 'providerId',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: {
          $ifNull: [{ $round: [{ $avg: '$reviews.rating' }, 1] }, 0],
        },
        totalReviews: { $size: '$reviews' },
      },
    },
    {
      $project: {
        reviews: 0,
        'userId.password': 0,
      },
    },
  ]);

  return result[0] || null;
}

export async function upsertProviderProfile(
  userId: string,
  profileData: Partial<IProviderProfile>
): Promise<any> {
  await ProviderProfile.findOneAndUpdate(
    { userId },
    { ...profileData, userId },
    { new: true, upsert: true, runValidators: true }
  );

  return getProviderByUserId(userId);
}

export async function queryProviders(
  filters: QueryFilters,
  page = 1,
  limit = 10
): Promise<{ profiles: any[]; total: number }> {
  const query: any = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.location) {
    query.location = filters.location;
  }

  if (filters.priceRange) {
    if (filters.priceRange === 'below_500') {
      query.price = { $lt: 500 };
    } else if (filters.priceRange === '500_1000') {
      query.price = { $gte: 500, $lte: 1000 };
    } else if (filters.priceRange === 'above_1000') {
      query.price = { $gt: 1000 };
    }
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    
    // Find users with matching names
    const User = require('../models/User').User;
    const matchingUsers = await User.find({ name: regex, role: 'provider' }).select('_id');
    const matchingUserIds = matchingUsers.map((u: any) => u._id);

    query.$or = [
      { userId: { $in: matchingUserIds } },
      { description: regex },
    ];
  }

  const skip = (page - 1) * limit;

  // Build aggregation pipeline stages
  const pipeline: any[] = [
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId',
      },
    },
    { $unwind: '$userId' },
    {
      $lookup: {
        from: 'reviews',
        localField: 'userId._id',
        foreignField: 'providerId',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: {
          $ifNull: [{ $round: [{ $avg: '$reviews.rating' }, 1] }, 0],
        },
        totalReviews: { $size: '$reviews' },
      },
    },
    {
      $project: {
        reviews: 0,
        'userId.password': 0,
      },
    },
  ];

  const countPipeline = [...pipeline, { $count: 'total' }];
  const dataPipeline = [
    ...pipeline,
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const [profiles, countResult] = await Promise.all([
    ProviderProfile.aggregate(dataPipeline),
    ProviderProfile.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.total || 0;

  return { profiles, total };
}
