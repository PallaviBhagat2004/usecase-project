# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install wget for health check
RUN apk add --no-cache wget

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

USER node

CMD ["node", "server.js"]
