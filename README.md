# LeadFlow CRM

LeadFlow CRM is a focused customer relationship management tool designed to help sales teams and individuals capture, organize, and nurture leads through the sales pipeline. It provides a centralized workspace to log lead details, track communication history, and schedule follow-up reminders so no opportunity slips through the cracks.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React | Frontend UI framework |
| Express | Backend API server |
| TypeScript | Type-safe development |
| PostgreSQL | Primary database |
| Redis | Caching and sessions |
| Prisma | Database ORM |
| Turborepo | Monorepo build system |
| Vite | Frontend build tool |

## Monorepo Structure

```
leadflow-crm/
├── apps/
│   ├── web/          # React/Vite frontend
│   └── api/          # Express backend
├── packages/         # Shared packages (if any)
├── turbo.json        # Turborepo configuration
├── package.json      # Root workspace configuration
└── tsconfig.base.json # Shared TypeScript config
```

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL and Redis)
- npm 10+

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` files in `apps/web` and `apps/api`
   - Update with your local configuration

3. Start development servers:
```bash
npm run dev
```

This will start both the web and API applications concurrently.

## Environment Setup

See the `.env.example` files in each workspace:
- `apps/web/.env.example` - Frontend environment variables
- `apps/api/.env.example` - Backend environment variables

## Available Scripts

- `npm run dev` - Start all workspaces in development mode
- `npm run build` - Build all workspaces for production
- `npm run test` - Run tests across all workspaces
- `npm run lint` - Lint code across all workspaces
- `npm run format` - Format code with Prettier

## Production Deployment

### Railway Setup

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Link your project:
```bash
railway link
```

4. Set environment variables:
   - Go to Railway dashboard
   - Select your service (API or Web)
   - Navigate to Variables tab
   - Use `.env.production.example` as reference
   - Set all required environment variables

5. Deploy to Railway:
```bash
railway up
```

## Rollback Procedure

If you need to rollback a deployment:

1. Go to Railway dashboard
2. Select the service (API or Web)
3. Navigate to the Deployments tab
4. Find the previous successful deployment
5. Click on the deployment
6. Click the "Rollback" button
7. Verify the rollback by checking the `/health` endpoint

## Environment Variables

### Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port (default: 3001) | Yes |
| `DATABASE_URL` | PostgreSQL connection URL | Yes |
| `REDIS_URL` | Redis connection URL | Yes |
| `JWT_SECRET` | Secret for JWT signing (generate with: `openssl rand -base64 64`) | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time (e.g., 7d) | Yes |
| `SMTP_HOST` | SMTP server hostname | Yes |
| `SMTP_PORT` | SMTP server port (usually 587) | Yes |
| `SMTP_USER` | SMTP username | Yes |
| `SMTP_PASS` | SMTP password | Yes |
| `FROM_EMAIL` | Email sender address | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `CORS_ORIGIN` | Allowed CORS origin (usually same as FRONTEND_URL) | Yes |
| `BCRYPT_ROUNDS` | Bcrypt salt rounds (recommended: 12) | Yes |

### Optional Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SENTRY_DSN` | Sentry error tracking DSN | No |
| `LOG_LEVEL` | Logging level (info/debug/warn/error) | No |
| `REMINDER_NOTIFICATIONS_ENABLED` | Enable email reminders (true/false) | No |
| `PASSWORD_RESET_EXPIRES_IN` | Password reset token expiration (default: 1h) | No |

## Monitoring

### Health Checks
- API Health: `https://your-api-url.railway.app/health`
- This endpoint returns service status, uptime, and environment info

### Logs
- Access logs via Railway dashboard: **Project → Service → Deployments → Logs**

### Error Monitoring
- If Sentry is configured, access error dashboard at: [https://sentry.io](https://sentry.io)
- Check the `SENTRY_DSN` environment variable for your project URL

### Metrics
- Monitor deployment status, resource usage, and performance in Railway dashboard
- Set up alerts for deployment failures or resource limits
