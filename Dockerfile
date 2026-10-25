# Production Dockerfile for The Suburban Outpost
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build frontend bundle
COPY . .
RUN npm run build

# Production Runner
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy build artifacts and runtime server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/articles-vault.json ./articles-vault.json
COPY --from=builder /app/automation-config.json ./automation-config.json
COPY --from=builder /app/automation-cycle.json ./automation-cycle.json
COPY --from=builder /app/subscribers-vault.json ./subscribers-vault.json
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/src ./src

# Expose Cloud Run port
EXPOSE 8080

CMD ["npm", "start"]
