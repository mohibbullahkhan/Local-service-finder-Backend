import { Prisma, VerificationStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { storageService } from '../../utils/storage';
import {
  GetProvidersQuery,
  CreateProviderProfileInput,
  UpdateProviderProfileInput,
  CreateServiceInput,
  UpdateServiceInput,
  AddPhotoInput,
} from './providers.schema';

export class ProvidersService {
  async listProviders(query: GetProvidersQuery) {
    const { city, area, category, q, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProviderProfileWhereInput = {
      isActive: true,
      verificationStatus: VerificationStatus.VERIFIED,
      ...(city && { city: { equals: city, mode: 'insensitive' } }),
      ...(area && { area: { equals: area, mode: 'insensitive' } }),
      ...(category && {
        categories: {
          some: { categoryId: category },
        },
      }),
      ...(q && {
        OR: [
          { businessName: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { ratingAvg: 'desc' },
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
      }),
      prisma.providerProfile.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getProviderById(id: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
        },
        categories: {
          include: { category: true },
        },
        services: true,
        photos: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            buyer: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!provider) {
      throw new AppError('Provider profile not found', 404, 'PROVIDER_NOT_FOUND');
    }

    return provider;
  }

  async createOwnProfile(userId: string, input: CreateProviderProfileInput) {
    const existing = await prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new AppError('Provider profile already exists for this user', 409, 'PROFILE_EXISTS');
    }

    const { categoryIds, ...profileData } = input;

    const profile = await prisma.providerProfile.create({
      data: {
        ...profileData,
        userId,
        categories: {
          create: categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
        categories: { include: { category: true } },
        services: true,
        photos: true,
      },
    });

    return profile;
  }

  async getOwnProfile(userId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
        },
        categories: {
          include: { category: true },
        },
        services: true,
        photos: true,
      },
    });

    if (!profile) {
      throw new AppError('Provider profile not found. Please create one first.', 404, 'PROFILE_NOT_FOUND');
    }

    return profile;
  }

  async updateOwnProfile(userId: string, input: UpdateProviderProfileInput) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError('Provider profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const { categoryIds, ...profileData } = input;

    return prisma.$transaction(async (tx) => {
      if (categoryIds) {
        await tx.providerCategory.deleteMany({
          where: { providerId: profile.id },
        });
        await tx.providerCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            providerId: profile.id,
            categoryId,
          })),
        });
      }

      return tx.providerProfile.update({
        where: { id: profile.id },
        data: profileData,
        include: {
          categories: { include: { category: true } },
          services: true,
          photos: true,
        },
      });
    });
  }

  // Service Management
  async addService(userId: string, input: CreateServiceInput) {
    const profile = await this.getOwnProfile(userId);

    const newService = await prisma.service.create({
      data: {
        ...input,
        providerId: profile.id,
      },
    });

    if (profile.verificationStatus === VerificationStatus.UNVERIFIED) {
      await prisma.providerProfile.update({
        where: { id: profile.id },
        data: { verificationStatus: VerificationStatus.PENDING },
      });
    }

    return newService;
  }

  async updateService(userId: string, serviceId: string, input: UpdateServiceInput) {
    const profile = await this.getOwnProfile(userId);
    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId: profile.id },
    });

    if (!service) {
      throw new AppError('Service not found or unauthorized', 404, 'SERVICE_NOT_FOUND');
    }

    return prisma.service.update({
      where: { id: serviceId },
      data: input,
    });
  }

  async deleteService(userId: string, serviceId: string) {
    const profile = await this.getOwnProfile(userId);
    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId: profile.id },
    });

    if (!service) {
      throw new AppError('Service not found or unauthorized', 404, 'SERVICE_NOT_FOUND');
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return { message: 'Service deleted successfully' };
  }

  // Photo Management
  async addPhoto(userId: string, input: AddPhotoInput, file?: Express.Multer.File) {
    const profile = await this.getOwnProfile(userId);

    let photoUrl = input.url;
    if (file) {
      photoUrl = await storageService.saveFile(file);
    }

    if (!photoUrl) {
      throw new AppError('Photo URL or file upload is required', 400, 'PHOTO_REQUIRED');
    }

    if (input.isCover) {
      await prisma.providerPhoto.updateMany({
        where: { providerId: profile.id },
        data: { isCover: false },
      });
    }

    return prisma.providerPhoto.create({
      data: {
        providerId: profile.id,
        url: photoUrl,
        isCover: input.isCover || false,
      },
    });
  }

  async deletePhoto(userId: string, photoId: string) {
    const profile = await this.getOwnProfile(userId);
    const photo = await prisma.providerPhoto.findFirst({
      where: { id: photoId, providerId: profile.id },
    });

    if (!photo) {
      throw new AppError('Photo not found or unauthorized', 404, 'PHOTO_NOT_FOUND');
    }

    if (photo.url.startsWith('/uploads/')) {
      await storageService.deleteFile(photo.url);
    }

    await prisma.providerPhoto.delete({
      where: { id: photoId },
    });

    return { message: 'Photo deleted successfully' };
  }

  async requestVerification(userId: string) {
    const profile = await this.getOwnProfile(userId);
    return prisma.providerProfile.update({
      where: { id: profile.id },
      data: { verificationStatus: VerificationStatus.PENDING },
    });
  }
}

export const providersService = new ProvidersService();
