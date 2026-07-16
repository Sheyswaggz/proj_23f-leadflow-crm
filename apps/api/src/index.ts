import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { logger } from './lib/logger.js';
import { createApp } from './app.js';
import { startReminderNotificationJob } from './jobs/reminderNotification.job.js';

if (process.env['SENTRY_DSN']) {
  Sentry.init({
    dsn: process.env['SENTRY_DSN'],
    environment: process.env['NODE_ENV'] || 'development',
    tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
    integrations: [new Sentry.Integrations.Express()],
    ],
    beforeSend: (event) => {
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });
  logger.info('Sentry initialized');
}

const PORT = process.env['PORT'] || 3001;

const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  startReminderNotificationJob();
});

process.on('uncaughtException', (error: Error) => {
  logger.fatal({ err: error }, 'Uncaught Exception');
  if (process.env['SENTRY_DSN']) {
    Sentry.captureException(error);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, _promise: Promise<any>) => {
  logger.fatal({ reason }, 'Unhandled Rejection');
  if (process.env['SENTRY_DSN']) {
    Sentry.captureException(reason);
  }
  server.close(() => {
    process.exit(1);
  });
});
