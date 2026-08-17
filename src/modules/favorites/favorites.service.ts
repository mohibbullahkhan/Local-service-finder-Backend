import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export class FavoritesService {
  async getFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        provider: {
          include: {
            user: {
              select: { id: true, name: true, phone: true, avatarUrl: true },
            },
            categories: {
              include: { category: true },
            },
            services: true,
            photos: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => fav.provider);
  }

  async addFavorite(userId: string, providerId: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new AppError('Provider profile not found', 404, 'PROVIDER_NOT_FOUND');
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_providerId: {
          userId,
          providerId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.favorite.create({
      data: {
        userId,
        providerId,
      },
    });
  }

  async removeFavorite(userId: string, providerId: string) {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_providerId: {
          userId,
          providerId,
        },
      },
    });

    if (!existing) {
      throw new AppError('Favorite not found', 404, 'FAVORITE_NOT_FOUND');
    }

    await prisma.favorite.delete({
      where: {
        userId_providerId: {
          userId,
          providerId,
        },
      },
    });

    return { message: 'Provider removed from favorites' };
  }
}

export const favoritesService = new FavoritesService();
