import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { envs } from '../config/envs';
import { IUser } from '../types/models';

export function generateToken(user: IUser): string {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    envs.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email });
}

export async function createUser(data: Partial<IUser>): Promise<IUser> {
  const user = new User(data);
  return user.save();
}
