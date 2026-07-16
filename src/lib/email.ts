import nodemailer from 'nodemailer';

const SMTP_HOST = process.env['SMTP_HOST'] ?? 'localhost';
const SMTP_PORT = parseInt(process.env['SMTP_PORT'] ?? '1025', 10);
const SMTP_USER = process.env['SMTP_USER'];
const SMTP_PASS = process.env['SMTP_PASS'];
const FROM_EMAIL = process.env['FROM_EMAIL'] ?? 'noreply@leadflow.local';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS ?? '' } : undefined,
});

export class EmailService {
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9fafb; }
    .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    .warning { padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LeadFlow CRM</h1>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>You requested to reset your password for your LeadFlow CRM account.</p>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
      <div class="warning">
        <strong>⚠️ Security Notice:</strong>
        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; LeadFlow CRM. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const textTemplate = `
LeadFlow CRM - Reset Your Password

You requested to reset your password for your LeadFlow CRM account.

Click the link below to reset your password. This link expires in 1 hour:

${resetUrl}

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

---
LeadFlow CRM
    `.trim();

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your LeadFlow CRM password',
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  async sendReminderNotificationEmail(
    to: string,
    data: { leadName: string; dueAt: Date; note?: string | null }
  ): Promise<void> {
    const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:5173';

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9fafb; }
    .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    .info-box { padding: 15px; background-color: #e0f2fe; border-left: 4px solid: #2563eb; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LeadFlow CRM</h1>
    </div>
    <div class="content">
      <h2>Follow-up Reminder: ${data.leadName}</h2>
      <p>You have a follow-up due for <strong>${data.leadName}</strong></p>
      <div class="info-box">
        <p><strong>Due:</strong> ${data.dueAt.toLocaleString()}</p>
        ${data.note ? `<p><strong>Note:</strong> ${data.note}</p>` : ''}
      </div>
      <p style="text-align: center;">
        <a href="${frontendUrl}/leads" class="button">View Leads</a>
      </p>
    </div>
    <div class="footer">
      <p>&copy; LeadFlow CRM. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const textTemplate = `
LeadFlow CRM - Follow-up Reminder

You have a follow-up due for ${data.leadName}

Due: ${data.dueAt.toLocaleString()}${data.note ? `\nNote: ${data.note}` : ''}

View your leads: ${frontendUrl}/leads

---
LeadFlow CRM
    `.trim();

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `Follow-up Reminder: ${data.leadName}`,
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
