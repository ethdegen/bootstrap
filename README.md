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
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```
