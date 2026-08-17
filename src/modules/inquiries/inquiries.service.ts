import { InquiryStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { CreateInquiryInput, UpdateInquiryStatusInput } from './inquiries.schema';

const ALLOWED_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  [InquiryStatus.PENDING]: [InquiryStatus.ACCEPTED, InquiryStatus.DECLINED, InquiryStatus.CANCELLED],
  [InquiryStatus.ACCEPTED]: [InquiryStatus.COMPLETED, InquiryStatus.CANCELLED],
  [InquiryStatus.DECLINED]: [],
  [InquiryStatus.COMPLETED]: [],
  [InquiryStatus.CANCELLED]: [],
};

export class InquiriesService {
  async createInquiry(buyerId: string, input: CreateInquiryInput) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: input.providerId },
    });

    if (!provider) {
      throw new AppError('Provider profile not found', 404, 'PROVIDER_NOT_FOUND');
    }

    if (provider.userId === buyerId) {
      throw new AppError('You cannot send an inquiry to your own provider profile', 400, 'SELF_INQUIRY_FORBIDDEN');
    }

    return prisma.inquiry.create({
      data: {
        buyerId,
        providerId: input.providerId,
        message: input.message,
        status: InquiryStatus.PENDING,
      },
      include: {
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async getSentInquiries(buyerId: string, status?: InquiryStatus) {
    return prisma.inquiry.findMany({
      where: {
        buyerId,
        ...(status && { status }),
      },
      include: {
        provider: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
            categories: { include: { category: true } },
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReceivedInquiries(userId: string, status?: InquiryStatus) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError('Provider profile not found', 404, 'PROVIDER_PROFILE_REQUIRED');
    }

    return prisma.inquiry.findMany({
      where: {
        providerId: profile.id,
        ...(status && { status }),
      },
      include: {
        buyer: {
          select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateInquiryStatus(userId: string, inquiryId: string, input: UpdateInquiryStatusInput) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        provider: true,
      },
    });

    if (!inquiry) {
      throw new AppError('Inquiry not found', 404, 'INQUIRY_NOT_FOUND');
    }

    const isProviderOwner = inquiry.provider.userId === userId;
    const isBuyerOwner = inquiry.buyerId === userId;

    if (!isProviderOwner && !isBuyerOwner) {
      throw new AppError('Unauthorized to update this inquiry status', 403, 'UNAUTHORIZED_INQUIRY_UPDATE');
    }

    // Buyers can only change status to CANCELLED
    if (isBuyerOwner && !isProviderOwner && input.status !== InquiryStatus.CANCELLED) {
      throw new AppError('Buyers can only cancel their own inquiries', 403, 'FORBIDDEN_BUYER_ACTION');
    }

    const currentStatus = inquiry.status;
    const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowedNextStatuses.includes(input.status)) {
      throw new AppError(
        `Invalid status transition from ${currentStatus} to ${input.status}. Allowed target status(es): ${allowedNextStatuses.join(', ') || 'None (Terminal state)'}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    return prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: input.status },
      include: {
        buyer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, businessName: true } },
      },
    });
  }
}

export const inquiriesService = new InquiriesService();
