import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../../../app.js';
import prisma from '../../../lib/prisma.js';

vi.mock('../../../lib/email.js', () => ({
  emailService: {
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    verifyConnection: vi.fn().mockResolvedValue(true),
  },
  EmailService: vi.fn(),
}));

const { emailService } = await import('../../../lib/email.js');

const app = createApp();

let testUserId: string;
const testUserEmail = 'resettest@example.com';
const testUserPassword = 'password123';

beforeAll(async () => {
  const passwordHash = await bcrypt.hash(testUserPassword, 10);
  const user = await prisma.user.create({
    data: {
      email: testUserEmail,
      passwordHash,
      name: 'Reset Test User',
    },
  });
  testUserId = user.id;
});

afterAll(async () => {
  await prisma.passwordResetToken.deleteMany({
    where: { userId: testUserId },
  });
  await prisma.user.delete({
    where: { id: testUserId },
  });
  await prisma.$disconnect();
});

describe('POST /api/v1/auth/forgot-password', () => {
  it('returns 200 for existing email and calls email service', async () => {
    vi.clearAllMocks();

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: testUserEmail })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('reset link has been sent');
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      testUserEmail,
      expect.stringContaining('reset-password?token=')
    );
  });

  it('returns 200 for non-existent email (no enumeration)', async () => {
    vi.clearAllMocks();

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('reset link has been sent');
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/auth/reset-password', () => {
  it('resets password with valid token', async () => {
    await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: testUserEmail });

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { userId: testUserId },
      orderBy: { createdAt: 'desc' },
    });

    expect(resetToken).toBeDefined();

    const mockArgs = vi.mocked(emailService.sendPasswordResetEmail).mock.calls[0];
    const resetUrl = mockArgs?.[1] ?? '';
    const tokenMatch = resetUrl.match(/token=([^&]+)/);
    expect(tokenMatch).toBeDefined();
    const plainToken = tokenMatch![1];

    const newPassword = 'newpassword123';
    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: plainToken, password: newPassword })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Password reset successfully');

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserEmail, password: newPassword })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.token).toBeDefined();
  });

  it('rejects expired token', async () => {
    await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: testUserEmail });

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { userId: testUserId },
      orderBy: { createdAt: 'desc' },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken!.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const mockArgs = vi.mocked(emailService.sendPasswordResetEmail).mock.calls[0];
    const resetUrl = mockArgs?.[1] ?? '';
    const tokenMatch = resetUrl.match(/token=([^&]+)/);
    const plainToken = tokenMatch![1];

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: plainToken, password: 'newpassword123' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error?.message).toContain('Invalid or expired');
  });

  it('rejects already used token', async () => {
    await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: testUserEmail });

    const mockArgs = vi.mocked(emailService.sendPasswordResetEmail).mock.calls[0];
    const resetUrl = mockArgs?.[1] ?? '';
    const tokenMatch = resetUrl.match(/token=([^&]+)/);
    const plainToken = tokenMatch![1];

    await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: plainToken, password: 'newpassword456' })
      .expect(200);

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: plainToken, password: 'anotherpassword789' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error?.message).toContain('Invalid or expired');
  });

  it('rejects invalid token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'invalidtokenrandomstring', password: 'newpassword123' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error?.message).toContain('Invalid or expired');
  });
});
