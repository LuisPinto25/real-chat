#!/bin/sh
set -e

echo "Waiting for PostgreSQL database to be ready..."
until bunx prisma db push; do
  echo "Database is unavailable or still starting up - sleeping 2s..."
  sleep 2
done

echo "Database is in sync! Starting NestJS backend with Bun..."
exec bun run start
