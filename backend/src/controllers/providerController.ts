import { Request, Response, NextFunction } from 'express';
import { providerProfileSchema } from '../validators/schemas';
import * as providerService from '../services/providerService';

// Predefined categories mapping key -> value
const CATEGORIES = [
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'tutor', name: 'Tutor' },
  { id: 'photographer', name: 'Photographer' },
  { id: 'home_cleaning', name: 'Home Cleaning' },
  { id: 'ac_technician', name: 'AC Technician' },
  { id: 'computer_repair', name: 'Computer Repair' },
];

export function getCategories(req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: CATEGORIES,
  });
}

export async function getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'provider') {
      res.status(403).json({ success: false, message: 'Only providers have a profile' });
      return;
    }

    const profile = await providerService.getProviderByUserId(req.user.id);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Provider profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function upsertProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'provider') {
      res.status(403).json({ success: false, message: 'Only providers can modify profiles' });
      return;
    }

    const parseResult = providerProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
      });
      return;
    }

    const profile = await providerService.upsertProviderProfile(req.user.id, parseResult.data);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, category, location, priceRange, page, limit } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const filters = {
      search: search as string,
      category: category as string,
      location: location as string,
      priceRange: priceRange as string,
    };

    const { profiles, total } = await providerService.queryProviders(filters, pageNum, limitNum);

    res.status(200).json({
      success: true,
      data: {
        profiles,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProviderDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    // Check if valid ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid profile ID format',
      });
      return;
    }

    // Try finding by Profile ID first, fallback to finding by User ID
    let profile = await providerService.getProviderById(id);
    if (!profile) {
      profile = await providerService.getProviderByUserId(id);
    }

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}
