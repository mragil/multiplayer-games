FROM oven/bun:1.3
WORKDIR /app
COPY . .
RUN bun install && bun run build
EXPOSE 3000
CMD ["bun", "run", "./build/index.js"]
