import 'dotenv/config';
import { createApp } from './app.js';
import { startReminderNotificationJob } from './jobs/reminderNotification.job.js';

const PORT = process.env.PORT || 3001;

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  startReminderNotificationJob();
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});
