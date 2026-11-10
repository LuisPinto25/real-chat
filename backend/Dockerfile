FROM oven/bun:1-alpine

WORKDIR /app

# Install openssl for prisma engine
RUN apk add --no-cache openssl

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

COPY prisma7.config.ts tsconfig*.json ./
COPY src ./src
RUN bunx prisma generate

COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
