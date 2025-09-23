FROM node:20-alpine

# Install Chrome dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip installing Chromium. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directory for WhatsApp session data
RUN mkdir -p /app/.wwebjs_auth

# Expose port
EXPOSE 8081

# Set environment variables
ENV NODE_ENV=production
ENV QR_SERVER_PORT=8081

# Start the bot
CMD ["node", "start-with-qr-server.cjs"]
