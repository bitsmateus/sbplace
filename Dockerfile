# ---- Build stage ----
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# placeholder values so `next build` never fails on a missing env var —
# the real values are provided at runtime by EasyPanel
ENV SESSION_SECRET=build-time-placeholder
ENV ADMIN_PASSWORD=build-time-placeholder
ENV DATA_DIR=/tmp/build-data

RUN npm run build
RUN npm prune --omit=dev

# ---- Runtime stage ----
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

RUN groupadd -r sbplace && useradd -r -g sbplace sbplace

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/app ./app
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/components ./components
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/proxy.js ./proxy.js
COPY --from=builder /app/jsconfig.json ./jsconfig.json

RUN mkdir -p /app/data/uploads && chown -R sbplace:sbplace /app/data

VOLUME ["/app/data"]

USER sbplace
EXPOSE 3000

CMD ["npm", "run", "start"]
