import { prisma } from '@/app/lib/prisma';

export interface UserData {
  email: string;
  password: string;
  name?: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
}

export class User {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });
  }

  static async create(data: UserData) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        name: data.name?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  static async findById(id: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }
}
