import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || '',
      }
    : undefined,
});

class EmailService {
  async sendEmail(options: SendEmailOptions): Promise<void> {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@leadflow.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const html = `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>Or copy this link: ${resetUrl}</p>`;
    const text = `Reset your password by visiting: ${resetUrl}`;
    await this.sendEmail({ to: email, subject: 'Password Reset Request', html, text });
  }

  async sendReminderNotificationEmail(
    email: string,
    { leadName, dueAt, note }: { leadName: string; dueAt: Date; note: string | null }
  ): Promise<void> {
    const text = `Reminder: ${leadName} - Due: ${dueAt.toISOString()}${note ? ` - Note: ${note}` : ''}`;
    const html = `<p>Reminder: <strong>${leadName}</strong></p><p>Due: ${dueAt.toISOString()}</p>${note ? `<p>Note: ${note}</p>` : ''}`;
    await this.sendEmail({ to: email, subject: 'Reminder Notification', html, text });
  }
}

export const emailService = new EmailService();
