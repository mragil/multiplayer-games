# Stage 1: Builder
FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY package.json ./
COPY .env.example ./.env
RUN bun install
COPY . .
RUN bun run build
RUN ls -la /app
RUN ls -la /app/build

# Stage 2: Serve
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]