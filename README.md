<div align="center">
  <div style="width: 80px; height: 80px; background-color: #4F8CFF; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; color: white; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(79, 140, 255, 0.4);">
    C
  </div>
  <h1>CodeAtlas</h1>
  <p><strong>Interactive GitHub Repository Visualization Platform</strong></p>
</div>

<br />

CodeAtlas is an advanced software architecture exploration tool that allows developers to visualize any GitHub repository as an interactive, navigable map. By analyzing folder structures, parsing AST for import/export dependencies, and applying semantic heuristics, CodeAtlas transforms flat codebases into deep spatial landscapes.

## ✨ Features

- **Instant Repository Ingestion:** Paste any public GitHub URL to clone, scan, and map the repository instantly.
- **AST Dependency Graphing:** Native TypeScript AST parsing automatically traces relationships, module exports, and circular dependencies.
- **Interactive Spatial Mapping:** Fluid grid layouts constructed with custom React Flow nodes for folders and files.
- **Fuzzy Search Navigation:** Search through thousands of modules and have the camera pan and highlight results automatically.
- **Metadata Inspector:** View raw file sizes, semantic languages, direct imports, and usage metrics per node.
- **Semantic Classification:** Files and folders are color-coded and structurally grouped by type (e.g. Hooks, Components, APIs, Utilities).

## 🏛️ Architecture

CodeAtlas is a full-stack **Turborepo** monorepo consisting of:

- **Frontend (`apps/web`)**: Next.js 15 App Router, React Flow for canvas rendering, TailwindCSS v4, and Zustand for state management.
- **Backend (`apps/api`)**: NestJS 10, executing spawned Git child processes in a sandboxed `.tmp` environment, combined with native TS compiler APIs for AST traversals.
- **Packages (`packages/*`)**: Shared TypeScript types, unified ESLint/TS configs, and a bespoke UI design system (`@codeatlas/ui`).

## 🛠️ Tech Stack

- **Frameworks:** Next.js (React 19), NestJS
- **Graph Engine:** React Flow (`@xyflow/react`)
- **State Management:** Zustand
- **Styling:** Tailwind CSS, Framer Motion
- **Parsing:** TypeScript Compiler API

## 🚀 Installation & Development

To run CodeAtlas locally, ensure you have **Node.js 20+**, **pnpm**, and **Git** installed on your system.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/codeatlas.git
cd codeatlas

# 2. Install dependencies via pnpm
pnpm install

# 3. Start both the Frontend and Backend servers simultaneously
pnpm dev
```

- **Web App:** Available at `http://localhost:3000`
- **API Server:** Available at `http://localhost:3001`

## 📂 Folder Structure

```
codeatlas/
├── apps/
│   ├── api/                  # NestJS backend parsing engine
│   └── web/                  # Next.js interactive frontend
├── packages/
│   ├── config/               # Shared Tailwind config
│   ├── eslint-config/        # Shared ESLint configuration
│   ├── types/                # Shared Graph and Repository types
│   ├── ui/                   # Shared React component library
│   └── utils/                # Shared helper functions
├── .tmp/                     # Ignored directory for cloned repositories
└── package.json              # Monorepo workspaces definition
```

## 🗺️ Roadmap & Version 2 Recommendations

- **Authentication & User Accounts:** Save maps, star repositories, and link to GitHub OAuth.
- **Private Repository Support:** Authenticated Git cloning.
- **Alternative Languages:** AST parsers for Python, Go, and Rust.
- **Live Branch Comparisons:** Visualize graph diffs between PRs.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
