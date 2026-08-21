import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { ProviderProfile } from '../models/ProviderProfile';
import mongoose from 'mongoose';

export async function toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: providerUserId } = req.params;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (!/^[0-9a-fA-F]{24}$/.test(providerUserId)) {
      res.status(400).json({ success: false, message: 'Invalid provider ID format' });
      return;
    }

    const customer = await User.findById(req.user.id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer account not found' });
      return;
    }

    // Verify provider profile exists
    const providerProfile = await ProviderProfile.findOne({ userId: providerUserId });
    if (!providerProfile) {
      res.status(404).json({ success: false, message: 'Provider profile not found' });
      return;
    }

    const providerObjectId = new mongoose.Types.ObjectId(providerUserId);
    const favorites = customer.favorites || [];
    const isFavorited = favorites.some((favId) => favId.toString() === providerUserId);

    if (isFavorited) {
      customer.favorites = favorites.filter((favId) => favId.toString() !== providerUserId);
    } else {
      customer.favorites = [...favorites, providerObjectId];
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      data: { isFavorited: !isFavorited },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const customer = await User.findById(req.user.id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer account not found' });
      return;
    }

    const favoriteProviderUserIds = customer.favorites || [];

    // Retrieve full ProviderProfile information for favorited items
    const profiles = await ProviderProfile.find({
      userId: { $in: favoriteProviderUserIds },
    }).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
}
