import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { generateAccessToken, generateRefreshToken, hashToken } from '../../utils/jwt';
import { RegisterInput, LoginInput, RefreshInput, LogoutInput, ResetPasswordInput } from './auth.schema';

export class AuthService {
  async register(input: RegisterInput) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: input.phone },
    });
    if (existingPhone) {
      throw new AppError('Phone number is already registered', 409, 'PHONE_EXISTS');
    }

    if (input.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingEmail) {
        throw new AppError('Email address is already registered', 409, 'EMAIL_EXISTS');
      }
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        passwordHash,
        role: input.role,
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

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenStr = generateRefreshToken();
    const tokenHash = hashToken(refreshTokenStr);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user,
      accessToken,
      refreshToken: refreshTokenStr,
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { phone: input.phone },
      include: {
        providerProfile: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid phone number or password', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid phone number or password', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenStr = generateRefreshToken();
    const tokenHash = hashToken(refreshTokenStr);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshTokenStr,
    };
  }

  async refresh(input: RefreshInput) {
    const tokenHash = hashToken(input.refreshToken);
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Revoke old refresh token (Token rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Issue new pair
    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      role: storedToken.user.role,
    });
    const newRefreshTokenStr = generateRefreshToken();
    const newHash = hashToken(newRefreshTokenStr);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        tokenHash: newHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenStr,
    };
  }

  async logout(input: LogoutInput) {
    const tokenHash = hashToken(input.refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId: string) {
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

  async resetPassword(input: ResetPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { phone: input.phone },
    });

    if (!user) {
      throw new AppError('No account registered with this phone number', 404, 'USER_NOT_FOUND');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Revoke all existing refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });

    return { message: 'Password updated successfully. Please log in with your new password.' };
  }
}

export const authService = new AuthService();
