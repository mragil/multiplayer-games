FROM oven/bun:1.3
WORKDIR /app
COPY . .
COPY .env.example .env
RUN bun install
EXPOSE 8080

CMD ["bun", "./src/index.ts"]
