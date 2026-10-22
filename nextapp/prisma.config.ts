import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer reads `.env` by itself. The dev container and CI provide
// DATABASE_URL directly, so a local `.env` is only loaded when one exists.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // Only Migrate needs a connection; `prisma generate` works without one.
        url: process.env.DATABASE_URL,
    },
});
