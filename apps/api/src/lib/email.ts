export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  // Email sending implementation
  console.log('Sending email to:', options.to, 'subject:', options.subject);
}

export default { sendEmail };


export class EmailService {
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: "Password Reset",
      text: "Your password reset token is: " + token,
    });
  }
}

export const emailService = new EmailService();
