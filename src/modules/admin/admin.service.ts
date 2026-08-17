import { VerificationStatus, Role, InquiryStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import {
  UpdateVerificationInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './admin.schema';

export class AdminService {
  async getVerifications(status: VerificationStatus = VerificationStatus.PENDING) {
    return prisma.providerProfile.findMany({
      where: { verificationStatus: status },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        categories: { include: { category: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateVerification(providerId: string, input: UpdateVerificationInput) {
    const profile = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!profile) {
      throw new AppError('Provider profile not found', 404, 'PROVIDER_NOT_FOUND');
    }

    return prisma.providerProfile.update({
      where: { id: providerId },
      data: { verificationStatus: input.status },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  async getStats() {
    const [
      totalBuyers,
      totalProvidersCount,
      totalAdmins,
      totalProviderProfiles,
      pendingVerificationsCount,
      inquiriesByStatus,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.BUYER } }),
      prisma.user.count({ where: { role: Role.PROVIDER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.providerProfile.count(),
      prisma.providerProfile.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      prisma.inquiry.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const formattedInquiryStats = Object.values(InquiryStatus).reduce((acc, status) => {
      const found = inquiriesByStatus.find((item) => item.status === status);
      acc[status] = found ? found._count._all : 0;
      return acc;
    }, {} as Record<InquiryStatus, number>);

    return {
      users: {
        buyers: totalBuyers,
        providers: totalProvidersCount,
        admins: totalAdmins,
        total: totalBuyers + totalProvidersCount + totalAdmins,
      },
      providers: {
        totalProfiles: totalProviderProfiles,
        pendingVerifications: pendingVerificationsCount,
      },
      inquiries: formattedInquiryStats,
    };
  }

  async createCategory(input: CreateCategoryInput) {
    const existing = await prisma.category.findUnique({
      where: { name: input.name },
    });
    if (existing) {
      throw new AppError('Category with this name already exists', 409, 'CATEGORY_EXISTS');
    }

    return prisma.category.create({
      data: input,
    });
  }

  async updateCategory(categoryId: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    if (input.name && input.name !== category.name) {
      const existing = await prisma.category.findUnique({
        where: { name: input.name },
      });
      if (existing) {
        throw new AppError('Category with this name already exists', 409, 'CATEGORY_EXISTS');
      }
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: input,
    });
  }
}

export const adminService = new AdminService();
