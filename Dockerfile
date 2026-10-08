FROM node:22-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

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

EXPOSE 3001

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
