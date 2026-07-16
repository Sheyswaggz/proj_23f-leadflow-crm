# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and prisma schema
COPY package.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma

# Install dependencies - NEVER use npm ci, always use npm install
RUN npm install && \
    npm cache clean --force

# Copy application code
COPY . .

# Build TypeScript application
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package.json and prisma schema for production
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Install production dependencies only
RUN npm install --only=production && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production \
    PORT=3001

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
