# ========================================
# Optimized Multi-Stage Dockerfile
# Next.js 16+ Application with Standalone Output
# ========================================

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ========================================
# Dependencies Stage (Production Only)
# ========================================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm install --legacy-peer-deps --omit=dev && \
    npm cache clean --force

# ========================================
# Build Dependencies Stage (All Dependencies)
# ========================================
FROM base AS build-deps

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies)
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# ========================================
# Build Stage
# ========================================
FROM build-deps AS builder

# Copy application source
COPY --chown=nextjs:nodejs . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Build the application with standalone output
# This creates .next/standalone directory with minimal dependencies
RUN npm run build

# ========================================
# Production Stage (Minimal Runtime)
# ========================================
FROM base AS production

# Set environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Copy standalone output (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create nextjs user and set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
