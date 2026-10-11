FROM node:22-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Keep corepack's downloaded pnpm in a shared location so the non-root user can
# reuse it at runtime instead of re-downloading it under its own HOME.
ENV COREPACK_HOME=/pnpm/corepack

# bcrypt is a native module: keep a C toolchain available for its build step.
RUN corepack enable \
  && apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first to leverage Docker layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY tests/package.json tests/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Run as the non-root user provided by the base image. Give it ownership of the
# app and the pnpm store/corepack cache used by the entrypoint.
RUN chown -R node:node /app /pnpm

EXPOSE 3001

USER node

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
