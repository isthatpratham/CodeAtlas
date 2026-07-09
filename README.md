<div align="center">
  <img src="./logo.png" width="96" height="96" alt="CodeAtlas Logo" style="margin-bottom: 16px;" />
  <h1>CodeAtlas</h1>
  <p><strong>Interactive Software Architecture & Codebase Map Explorer</strong></p>

  [![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)
  [![Railway Deployment](https://img.shields.io/badge/Backend-Railway-0B0D0E?logo=railway&logoColor=white)](https://railway.app)
  [![Monorepo Turborepo](https://img.shields.io/badge/Build-Turborepo-FF1E56?logo=turborepo&logoColor=white)](https://turbo.build)
  [![React Flow](https://img.shields.io/badge/Graph-React%20Flow-FF007F)](https://reactflow.dev)
</div>

<br />

**CodeAtlas** is an advanced software architecture exploration platform that transforms flat, complex codebases into living, interactive spatial maps. By cloning public GitHub repositories, scanning their file structures, parsing AST (Abstract Syntax Tree) relationships via the TypeScript Compiler API, and rendering them in an optimized interactive canvas, CodeAtlas lets you navigate codebase structure and dependencies like Google Maps.

---

## ✨ Features

- **⚡ Instant Ingestion:** Paste any public GitHub URL to clone, extract AST relationships, and map the architecture within seconds.
- **🗺️ Living Relationship Explorer:** Directed dependency lines draw themselves on-the-fly and host hardware-accelerated pulse particles showing import directions.
- **🏛️ Multi-Perspective Mapping:** Toggle between specialized views (Architecture, Dependency, Radial) depending on your exploration needs.
- **🔍 Smart Search & Focus:** Instantly search through folders and modules with fuzzy matching, panning the canvas directly to findings.
- **📊 Code Metadata Inspector:** Get file sizing, imports/exports counts, language metrics, and direct relationships on node selections.
- **🛡️ Custom Visual Style:** Renders circular dependency loops with distinctive amber highlight lines, muted hierarchy lines, and bright selection outlines.
- **🧩 Semantic Classification:** Auto-detects and color-codes architectural elements (e.g. Components, Hooks, API endpoints, Utilities) based on file analysis.

---

## 🗺️ Graph Perspectives

To make complex software relationships highly readable without creating visual noise, CodeAtlas supports three distinct visualization modes:

### 1. 📂 Architecture Perspective
- **Focus:** Structural codebase hierarchy and file containment.
- **Behavior:** Renders directory folders containing files. Uses thin, low-opacity gray lines to visualize structure while hiding all import lines to reduce clutter.

### 2. 🔌 Dependency Perspective
- **Focus:** Module interactions and data flow.
- **Behavior:** Traces semantic code dependencies. Visualizes import/export relationships with blue lines featuring flowing directional pulses. Traces circular dependency loops with distinctive amber highlight lines.

### 3. 🌀 Radial Perspective
- **Focus:** High-impact modules and context mapping.
- **Behavior:** Renders only high-importance "core" modules, direct relationships connected to the root module, and relationships connected to the currently selected or hovered node, filtering out background noise.

---

## ⚙️ Interactive Edge Filtering

Filter visual relationships dynamically to match your workflow:
- **Automatic:** Intelligently defaults to the perspective's base filtering.
- **Selected:** Shows only incoming and outgoing dependencies of the selected node.
- **Hovered:** Focuses lines exclusively on the node under your mouse pointer, fading other elements.
- **All:** Overrides filtering to show all computed relationships on the canvas.

---

## 🏛️ Architecture & Workspace

CodeAtlas is built as a unified **Turborepo monorepo**:

```
codeatlas/
├── apps/
│   ├── api/                  # NestJS backend parsing engine (cloning + AST extraction)
│   └── web/                  # Next.js 15 interactive frontend (React Flow + Zustand)
├── packages/
│   ├── config/               # Shared tooling configurations
│   ├── eslint-config/        # Monorepo linting standards
│   ├── types/                # Shared Graph and Repository TypeScript typings
│   ├── ui/                   # Modular UI design system components
│   └── utils/                # Shared utilities (e.g. url validator)
├── .tmp/                     # Ignored directory for cloned repositories
└── package.json              # Workspace packages definition
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (React 19), Zustand, Tailwind CSS, Framer Motion
- **Backend:** NestJS 10, Git CLI child-process sandbox
- **Graph Renderer:** React Flow (`@xyflow/react`)
- **AST Parsing:** TypeScript Compiler API

---

## 🚀 Installation & Local Development

Ensure you have **Node.js 20+**, **pnpm**, and **Git** installed on your system.

```bash
# 1. Clone the repository
git clone https://github.com/isthatpratham/CodeAtlas.git
cd CodeAtlas

# 2. Install dependencies
pnpm install

# 3. Start development servers
pnpm dev
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001`

---

## 🌐 Deployment & Hosting

CodeAtlas is deployed in a decoupled full-stack architecture:

### 1. Backend (Railway)
The API service is deployed on **Railway** to support spawning sandboxed git operations and directory parsing:
- Requires a Docker environment or Node.js start command (`npm run start:prod` in `apps/api`).
- Configure the environment variable:
  - `PORT=3001`
- Next.js frontend points to this service URL via `NEXT_PUBLIC_API_URL`.

### 2. Frontend (Vercel)
The interactive client-side application is hosted on **Vercel** for fast edge loading:
- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- Build Command: `pnpm run build`
- Install Command: `pnpm install`
- Environment Variables:
  - `NEXT_PUBLIC_API_URL` (Set to your deployed Railway backend URL)

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place! Please check [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
