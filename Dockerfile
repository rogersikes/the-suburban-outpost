# Production Dockerfile for The Suburban Outpost
FROM node:22-slim

WORKDIR /app

ENV PORT=8080

# Copy all repository files
COPY . .

# Install dependencies and build client bundle
RUN npm install --legacy-peer-deps
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
