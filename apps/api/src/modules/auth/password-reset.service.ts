import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { emailService } from '../../lib/email';
import { AppError } from '../../types/index';

const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'http://localhost:5173';

class PasswordResetService {
  async requestReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${plainToken}`;

    await emailService.sendPasswordResetEmail(email, resetUrl);
  }

  async resetPassword(plainToken: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });
  }
}

export const passwordResetService = new PasswordResetService();
