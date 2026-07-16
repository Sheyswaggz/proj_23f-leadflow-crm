import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { emailService } from '../lib/email.js';

export function startReminderNotificationJob(): void {
  const enabled = process.env['REMINDER_NOTIFICATIONS_ENABLED'];

  if (enabled === 'false') {
    console.log('Reminder notifications disabled');
    return;
  }

  cron.schedule('*/15 * * * *', async () => {
    const windowEnd = new Date(Date.now() + 15 * 60 * 1000);

    const reminders = await prisma.followUpReminder.findMany({
      where: {
        isCompleted: false,
        dueAt: {
          lte: windowEnd,
        },
        notifiedAt: null,
      },
      include: {
        lead: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    let sent = 0;
    let errors = 0;

    for (const reminder of reminders) {
      try {
      await emailService.sendReminderNotificationEmail(
        reminder.user.email,
        `Reminder: ${leadName}`,
        `You have a reminder for ${leadName} due at ${dueAt}. Note: ${note}`
      );

        await prisma.followUpReminder.update({
          where: { id: reminder.id },
          data: { notifiedAt: new Date() },
        });

        sent++;
      } catch (err) {
        errors++;
        console.error(`Failed to send reminder ${reminder.id}:`, err);
      }
    }

    console.log(`Reminder job complete: ${sent} sent, ${errors} errors`);
  });

  console.log('Reminder notification job scheduled (every 15 minutes)');
}
