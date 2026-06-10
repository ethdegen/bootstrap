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
│   ├── server (Server-side Sources)
│   |   ├── webapi (WebAPI-related Sources)
│   │   └── ...
│   └── ...
├── styles (CSS-Related Stuff)
│   ├── globals.css (CSS Globals)
│   └── ...
├── next.config.mjs
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

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
`npm run test:e2e:install` (Next App) and `python -m playwright install`
(FastAPI) to fetch the matching browsers.

`playwright.config.ts` starts `next dev` automatically (a production build in
CI), runs specs from `e2e/` against Chromium, Firefox, WebKit and a mobile
Chrome profile, and keeps traces, screenshots and video for failures.

```sh
npm run test:e2e                # headless run of every project
npm run test:e2e -- --project=chromium e2e/home.spec.ts
npm run test:e2e:ui             # UI mode, served on 0.0.0.0 for the host browser
npm run test:e2e:codegen        # record a new spec
npm run test:e2e:report         # open the last HTML report
```

Set `PLAYWRIGHT_BASE_URL` to test another target and
`PLAYWRIGHT_EXTERNAL_TARGET=1` to skip the managed dev server.
