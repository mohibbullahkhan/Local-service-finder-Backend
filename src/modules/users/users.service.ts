import { prisma } from '../../config/prisma';
import { UpdateUserInput } from './users.schema';
import { AppError } from '../../utils/AppError';

export class UsersService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        providerProfile: {
          include: {
            categories: {
              include: { category: true },
            },
            services: true,
            photos: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  async updateUser(userId: string, input: UpdateUserInput) {
    if (input.email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: input.email, NOT: { id: userId } },
      });
      if (existingEmail) {
        throw new AppError('Email is already taken by another account', 409, 'EMAIL_TAKEN');
      }
    }

    if (input.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: input.phone, NOT: { id: userId } },
      });
      if (existingPhone) {
        throw new AppError('Phone number is already taken by another account', 409, 'PHONE_TAKEN');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.phone && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        providerProfile: {
          include: {
            categories: {
              include: { category: true },
            },
            services: true,
            photos: true,
          },
        },
      },
    });

    return updatedUser;
  }
}

export const usersService = new UsersService();
