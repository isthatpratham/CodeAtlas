# Contributing to CodeAtlas

Thank you for your interest in contributing to CodeAtlas! We welcome contributions of all forms—bug reports, feature requests, documentation updates, and pull requests. 

Please read this guide to understand our development workflow, coding standards, and submission guidelines.

---

## 📋 Code of Conduct

By participating in this project, you agree to maintain a respectful, welcoming, and collaborative environment. Please be professional and constructive in all communication.

---

## 🛠️ Getting Started

### Prerequisites
To build and run CodeAtlas locally, you need:
- **Node.js** (v20 or higher)
- **pnpm** (v8 or higher)
- **Git** (v2 or higher)

### Local Setup
1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/CodeAtlas.git
   cd CodeAtlas
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Start the development servers**:
   ```bash
   pnpm dev
   ```
   - **Frontend App:** `http://localhost:3000`
   - **Backend API:** `http://localhost:3001`

---

## 📂 Development Workflow

We use **Turborepo** to orchestrate our monorepo workspaces. The core workspace layout is:

- `apps/web`: Next.js 15 client-side visualization application.
- `apps/api`: NestJS API parsing and AST analysis engine.
- `packages/ui`: Shared design system components.
- `packages/types`: Shared TypeScript interface/type definitions.

### Common Workspace Commands

- **Run Dev Servers:** `pnpm dev` (starts frontend & backend in watch mode)
- **Format Code:** `pnpm exec prettier --write .` (formats all files)
- **Run Linting:** `pnpm run lint` (checks code rules and formatting)
- **Production Build:** `pnpm run build` (compiles all packages/apps)

---

## 🌿 Git Branching & Commits

### Branch Naming Conventions
Create a descriptive branch for your work:
- Features: `feature/short-description`
- Bug fixes: `bugfix/short-description`
- Documentation: `docs/short-description`
- Refactoring: `refactor/short-description`

### Commit Messages
We follow the **Conventional Commits** specification. Commit messages should be structured as follows:

```
<type>(<scope>): <short description>
```

**Common Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation-only changes
- `style`: Formatting, missing semi-colons, etc. (no production code changes)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Build tasks, package manager configurations, etc.

*Example:* `feat(web): add radial graph visualization perspective`

---

## 📐 Coding Guidelines

1. **TypeScript First:** All workspace code must be fully type-safe. Avoid using `any`; define concrete interfaces or types in `packages/types`.
2. **Component Conventions:**
   - Keep React components modular and reusable under `apps/web/features/` or `packages/ui`.
   - Prefer Tailwind utility classes for styling. Avoid inline style blocks unless computing dynamic positions on-the-fly.
3. **Zustand State Patterns:**
   - Modify canvas state using action functions inside Zustand slices.
   - Use selectors to subscribe only to the necessary state variables to avoid unnecessary re-renders.
4. **Comment Code:** Preserve all existing docstrings and comments. Add comments for complex layout math or AST parser structures.

---

## 🚀 Submitting a Pull Request

Before you submit a pull request, ensure your branch is up-to-date with `main` and passes all checks:

1. **Format your code**:
   ```bash
   pnpm exec prettier --write .
   ```
2. **Run lint and type checks**:
   ```bash
   pnpm run lint
   ```
3. **Verify the build compiles successfully**:
   ```bash
   pnpm run build
   ```
4. **Push to your fork** and submit a Pull Request to our `main` branch.
5. Provide a clear explanation of your changes, the motivation behind them, and how you verified/tested them.

---

## 🌐 Deployment Pipeline

CodeAtlas is configured for continuous deployment:
- **Frontend (Vercel):** Frontend pull requests automatically trigger a Vercel deployment preview. Merges to `main` go live immediately.
- **Backend (Railway):** Backend commits trigger automated Docker/Node builds on Railway.
