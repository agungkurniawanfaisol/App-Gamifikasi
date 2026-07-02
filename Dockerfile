# =============================================================================
# Production Dockerfile — multi-stage build with Next.js standalone output
# Stages: deps → builder → runner
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: deps — install production dependencies only
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 2: builder — generate Prisma client and build Next.js standalone
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build
# Standalone output does not bundle public/; copy it so server.js can serve static assets.
RUN cp -r public .next/standalone/public

# -----------------------------------------------------------------------------
# Stage 3: runner — minimal production image with non-root user
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl mysql-client
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=5174

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output from builder stage (includes public/)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure Prisma CLI + engines exist for migrate deploy at container start
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema and migrations for runtime migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Image optimization for next/image in production (Alpine-native sharp)
USER root
RUN npm install sharp@0.33.5 --omit=dev --no-package-lock && chown -R nextjs:nodejs node_modules/sharp node_modules/@img 2>/dev/null || chown -R nextjs:nodejs node_modules/sharp
USER nextjs

EXPOSE 5174

# Run database migrations, generate client, then start the standalone Next.js server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && node server.js"]
