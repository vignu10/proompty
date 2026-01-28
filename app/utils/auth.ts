import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { env } from '@/app/lib/env';

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

export function generateToken(userId: string) {
  return sign({ userId }, env.JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string) {
  try {
    return verify(token, env.JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}
