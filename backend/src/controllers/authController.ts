import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/schemas';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
      });
      return;
    }

    const { name, email, password, role } = parseResult.data;

    // Check if user already exists
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Registration failed',
        errors: ['Email is already registered'],
      });
      return;
    }

    const user = await authService.createUser({ name, email, password, role });
    const token = authService.generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await authService.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
        errors: ['Invalid email or password'],
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
        errors: ['Invalid email or password'],
      });
      return;
    }

    const token = authService.generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
