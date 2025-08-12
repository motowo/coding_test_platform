# =================================================================
# SkillGaug API Dockerfile
# Multi-stage build for production optimization
# =================================================================

# Development stage
FROM node:20-alpine AS development
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Install dependencies including devDependencies for development
COPY ./api/package*.json ./
RUN npm ci --include=dev

# Copy source code and database schema
COPY ./api/ .
COPY ./database/ ./database/

# Generate Prisma client
RUN npx prisma generate --schema=./database/schema.prisma

# Expose port
EXPOSE 4000

# Development command
CMD ["npm", "run", "dev"]

# =================================================================
# Build stage  
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY ./api/package*.json ./
RUN npm ci

# Copy source code and database schema
COPY ./api/ .
COPY ./database/ ./database/

# Generate Prisma client and build
RUN npx prisma generate --schema=./database/schema.prisma
RUN npm run build

# =================================================================
# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S skillgaug -u 1001

# Install production dependencies only
COPY ./api/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application and Prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/database/schema.prisma ./database/schema.prisma

# Change ownership to non-root user
RUN chown -R skillgaug:nodejs /app
USER skillgaug

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Production command
CMD ["node", "dist/index.js"]