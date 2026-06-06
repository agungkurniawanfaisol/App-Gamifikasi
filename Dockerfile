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
RUN apk add --no-cache openssl
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

# Copy Prisma schema and migrations for runtime migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 5174

# Run database migrations then start the standalone Next.js server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
