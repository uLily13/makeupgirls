# Production image for the makeupgirls storefront + admin.
FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source and build.
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000

# Bind to all interfaces so the mapped port works from the host.
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
