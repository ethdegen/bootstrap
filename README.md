## Bootstrap template

This template is intended for bootstrapping agentic AI application products.
It permits starting simple yet with ample room to grow to production grade.

### FastAPI structure

The FastAPI server is in `/fastapi`. Its goal is to implement and expose the
primary backend of the application including LangChains via LangServe and/or
LlamaIndex and/or HuggingFaces. If beneficial, this FastAPI server can also
host secondary frontends such as Streamlit implementations for data analysis.

For expediency, the FastAPI server does not have database access. Its intent
is executing AI-related tasks in a stateless manner taking advantage of the
wealth of Python-centric libraries.

The FastAPI server has this folder structure:

```txt {6-10,14-15}
fastapi
├── src (AI-focused Sources)
│   ├── app.py
│   └── ...
├── tests (Unit & Integration Tests)
└── pyproject.toml
```

### Next App structure

The Next.js App is in `/nextapp`. Its goal is to implement and expose the
primary frontend of the application as well as any backends-for-frontend
and/or secondary backends, such as NextAuth, where implementing them as part
of the Next App streamlines and accelerates development versus alternatives.

To help kickstart application development, the ShadCN UI CLI has been pre-configured.

The Prisma Project is owned by the Next App. Prisma Migrations must be
deployed along with this app and the Prisma Schema resides within it.

Prisma 7 is configured by `prisma.config.ts` (Schema and Migrations paths and
the `DATABASE_URL` connection for Migrate). `prisma generate` runs on every
install and writes the TypeScript client to `src/generated/prisma` (gitignored);
import the shared, driver-adapter-backed client from `src/server/prisma.ts`:

```ts
import { prisma } from "@/src/server/prisma";
```

The database ships with pgvector, which the Schema enables through
`extensions = [vector]` (created by the initial migration). Prisma has
no native vector type, so declare embedding columns as
`Unsupported("vector(1536)")` and query them with `prisma.$queryRaw`.

```sh
npm run db:migrate   # author & apply a migration (prisma migrate dev)
npm run db:deploy    # apply pending migrations   (prisma migrate deploy)
npm run db:generate  # regenerate the client      (prisma generate)
```

The Next App has this folder structure:

```txt {6-10,14-15}
nextapp
├── prisma (Prisma ORM Project)
│   ├── schema.prisma (Prisma DB Schema)
│   └── ...
├── app (App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── components (React Components)
│   ├── ui (ShadCN UI Components)
│   │   └── ...
│   └── ...
├── e2e (Playwright UX Tests)
│   └── ...
├── lib (Frontend-focused Libraries)
│   ├── utils.ts (ShadCN UI Utilities)
│   └── ...
├── public (Public-facing Assets)
│   ├── favicon.ico (Favicon Branding)
│   └── ...
├── src (Backend-focused Sources)
│   ├── generated/prisma (Generated Prisma Client, gitignored)
│   ├── server (Server-side Sources)
│   |   ├── prisma.ts (Shared Prisma Client)
│   |   ├── webapi (WebAPI-related Sources)
│   │   └── ...
│   └── ...
├── styles (CSS-Related Stuff)
│   ├── globals.css (CSS Globals)
│   └── ...
├── next.config.mjs
├── package.json
├── playwright.config.ts
├── pnpm-workspace.yaml
├── postcss.config.js
├── prisma.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Package managers

The Next App works with both **npm** and **pnpm**; pick one per checkout and run
every command through it. No lockfile is committed, so whichever you use
resolves the ranges in `package.json` on install.

| Task                          | npm                                    | pnpm                                 |
| ----------------------------- | -------------------------------------- | ------------------------------------ |
| Install (+ `prisma generate`) | `npm install`                          | `pnpm install`                       |
| Run a script                  | `npm run dev`                          | `pnpm run dev`                       |
| Pass extra args to a script   | `npm run test:e2e -- --project=webkit` | `pnpm run test:e2e --project=webkit` |
| Run a local binary            | `npm exec -- tsc --noEmit`             | `pnpm exec tsc --noEmit`             |

Both package managers only run dependency install scripts that were reviewed
(pnpm always; npm from v12). The reviewed list is kept twice, in
`allowScripts` (`package.json`, read by npm) and `allowBuilds`
(`pnpm-workspace.yaml`, read by pnpm); keep them in sync when adding a
dependency that needs a build step.

The dev container ships both (pnpm is pinned by `PNPM_VERSION` in
`.devcontainer/Dockerfile`). VS Code tasks and launch configurations call
`${config:npm.packageManager}`, which `.vscode/settings.json` sets to `npm`;
change it to `pnpm` to switch every task. `playwright.config.ts` starts the dev
server with the package manager that launched it. CI runs the Next App jobs
once per package manager.

When switching an existing checkout between the two, delete `node_modules`
first; their layouts differ.

### Playwright

Chromium, Firefox and WebKit are baked into the dev container image at
`/ms-playwright` (`$PLAYWRIGHT_BROWSERS_PATH`) together with their OS libraries,
so the NodeJS and Python bindings share one set of browser builds and no
download is needed on first run.

Versions must stay aligned across three files, otherwise Playwright reports
`Executable doesn't exist at /ms-playwright/...`:

| File                       | Pin                         |
| -------------------------- | --------------------------- |
| `.devcontainer/Dockerfile` | `PLAYWRIGHT_*_VERSION` args |
| `nextapp/package.json`     | `@playwright/test`          |
| `fastapi/pyproject.toml`   | `playwright`                |

After bumping a version, either rebuild the container or run
`npm run test:e2e:install` / `pnpm run test:e2e:install` (Next App) and `python -m playwright install`
(FastAPI) to fetch the matching browsers.

`playwright.config.ts` starts `next dev` automatically (a production build in
CI), runs specs from `e2e/` against Chromium, Firefox, WebKit and a mobile
Chrome profile, and keeps traces, screenshots and video for failures.

```sh
npm run test:e2e                # headless run of every project (or: pnpm run test:e2e)
npm run test:e2e -- --project=chromium e2e/home.spec.ts
pnpm run test:e2e --project=chromium e2e/home.spec.ts
npm run test:e2e:ui             # UI mode, served on 0.0.0.0 for the host browser
npm run test:e2e:codegen        # record a new spec
npm run test:e2e:report         # open the last HTML report
```

Set `PLAYWRIGHT_BASE_URL` to test another target and
`PLAYWRIGHT_EXTERNAL_TARGET=1` to skip the managed dev server.

### Continuous Integration

`.github/workflows/ci.yaml` runs these jobs in parallel on every push and pull
request (and on demand); both Next App jobs run once with npm and once with pnpm:

| Job           | Runs                                                                                 |
| ------------- | ------------------------------------------------------------------------------------ |
| `fastapi`     | Poetry install, Pytest                                                               |
| `nextapp`     | Install, Prisma validate/format check/generate, `tsc --noEmit`, ESLint, `next build` |
| `nextapp_e2e` | Install, Prisma generate/migrate deploy, Playwright across browsers                  |

The database-backed job uses a `pgvector/pgvector:pg18-trixie` service, matching
the dev container's PostgreSQL 18 with pgvector, so Prisma Migrations, including
`CREATE EXTENSION vector`, apply as they do locally. The Playwright HTML report is
uploaded as a build artifact per package manager.
