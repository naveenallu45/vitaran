import { IUser } from './models';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'customer' | 'provider';
      };
    }
  }
}
