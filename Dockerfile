# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Default sites path
ENV SITES_PATH=/var/www/sites
ENV NODE_ENV=production
ENV PORT=3000

# Create default sites directory
RUN mkdir -p /var/www/sites

EXPOSE 3000

CMD ["node", "dist/server.js"]
