# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm install && \
    npm cache clean --force
RUN npx prisma generate
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
RUN apk add --no-cache openssl
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=3000
USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
