# Single-container image for the Sabano website (Next.js standalone + SQLite).

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /repo

# ---- dependencies (native modules are compiled here) -------------------------
FROM base AS deps
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/db/package.json packages/db/
COPY packages/i18n/package.json packages/i18n/
COPY packages/ui/package.json packages/ui/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- build ------------------------------------------------------------------
FROM deps AS build
COPY . .
ENV NODE_ENV=production
ARG SITE_URL=https://sabano.ir
ENV SITE_URL=${SITE_URL}
RUN pnpm i18n:check && pnpm --filter @sabano/web build

# ---- runtime ----------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data \
    MIGRATIONS_DIR=/app/migrations
WORKDIR /app
RUN groupadd --gid 1001 sabano \
 && useradd --uid 1001 --gid sabano --create-home sabano \
 && mkdir -p /data \
 && chown sabano:sabano /data
COPY --from=build --chown=sabano:sabano /repo/apps/web/.next/standalone ./
COPY --from=build --chown=sabano:sabano /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=sabano:sabano /repo/apps/web/public ./apps/web/public
COPY --from=build --chown=sabano:sabano /repo/packages/db/migrations ./migrations
USER sabano
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Migrations, first-run seed, admin bootstrap and daily backups run from instrumentation.ts.
CMD ["node", "apps/web/server.js"]
