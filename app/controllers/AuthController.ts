import { NextResponse } from 'next/server';
import { User, UserData } from '@/app/models/User';
import { verifyPassword, generateToken, hashPassword } from '@/app/utils/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthController {
  static async login(email: string, password: string) {
    // Input validation
    if (!email?.trim()) {
      return { error: 'Email is required', status: 400 };
    }

    if (!EMAIL_REGEX.test(email)) {
      return { error: 'Invalid email format', status: 400 };
    }

    if (!password?.trim()) {
      return { error: 'Password is required', status: 400 };
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return { error: 'Invalid email or password', status: 401 };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { error: 'Invalid email or password', status: 401 };
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    return {
      data: {
        token,
        user: userWithoutPassword,
      },
      status: 200,
    };
  }

  static async signup(data: UserData) {
    // Input validation
    if (!data.email?.trim()) {
      return { error: 'Email is required', status: 400 };
    }

    if (!EMAIL_REGEX.test(data.email)) {
      return { error: 'Invalid email format', status: 400 };
    }

    if (!data.password?.trim()) {
      return { error: 'Password is required', status: 400 };
    }

    if (data.password.length < 8) {
      return { error: 'Password must be at least 8 characters', status: 400 };
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(data.email);
    if (existingUser) {
      return { error: 'Email already registered', status: 400 };
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await User.create({
      ...data,
      password: hashedPassword,
    });

    const token = generateToken(user.id);

    return {
      data: {
        token,
        user,
      },
      status: 201,
    };
  }
}
