FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Default sites path
ENV SITES_PATH=/var/www/sites
ENV NODE_ENV=production
ENV PORT=3000

# Create default sites directory
RUN mkdir -p /var/www/sites

EXPOSE 3000

CMD ["node", "dist/server.js"]
