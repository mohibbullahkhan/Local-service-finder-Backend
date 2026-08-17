import { prisma } from '../../config/prisma';
import { UpdateUserInput } from './users.schema';
import { AppError } from '../../utils/AppError';

export class UsersService {
  async updateUser(userId: string, input: UpdateUserInput) {
    if (input.email) {
      const existing = await prisma.user.findFirst({
        where: { email: input.email, NOT: { id: userId } },
      });
      if (existing) {
        throw new AppError('Email is already taken by another account', 409, 'EMAIL_TAKEN');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name && { name: input.name }),
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
      },
    });

    return updatedUser;
  }
}

export const usersService = new UsersService();
