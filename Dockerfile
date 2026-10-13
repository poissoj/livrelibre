FROM node:22-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Keep corepack's downloaded pnpm in a shared location so the non-root user can
# reuse it at runtime instead of re-downloading it under its own HOME.
ENV COREPACK_HOME=/pnpm/corepack
ENV HOME=/home/node

# bcrypt is a native module: keep a C toolchain available for its build step.
# Create /app and /pnpm owned by the non-root `node` user up front, so install,
# build and runtime never need a recursive chown (which would copy every file,
# node_modules included, into an extra image layer).
RUN corepack enable \
  && apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /app /pnpm \
  && chown node:node /app /pnpm

WORKDIR /app

# Run as the non-root user provided by the base image for install, build and
# runtime.
USER node

# Install dependencies first to leverage Docker layer caching.
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY --chown=node:node apps/server/package.json apps/server/
COPY --chown=node:node apps/web/package.json apps/web/
COPY --chown=node:node packages/shared/package.json packages/shared/
COPY --chown=node:node tests/package.json tests/

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

RUN pnpm build

EXPOSE 3001

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
