# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/node_modules ./node_modules
# Install tsx to run server.ts in production if not using pre-compiled js
RUN npm install -g tsx

EXPOSE 3000
ENV NODE_ENV=production
CMD ["tsx", "server.ts"]
