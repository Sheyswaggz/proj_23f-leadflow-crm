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
