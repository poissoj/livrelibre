#!/bin/sh
set -e

echo "Applying database migrations..."
pnpm --filter @livrelibre/server migrate:db

if [ "$SEED_DEMO" = "true" ]; then
  echo "Seeding demo data..."
  pnpm --filter @livrelibre/server seed
fi

echo "Starting server..."
exec pnpm --filter @livrelibre/server start
