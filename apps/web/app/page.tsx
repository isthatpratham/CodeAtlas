"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  BookOpen,
  Map,
  GitFork,
  BarChart2,
  Search as SearchIcon,
  Compass,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  ArrowLeft,
} from "lucide-react";
import {
  Button,
  Input,
  Card,
  Container,
  Section,
  Badge,
  Modal,
  LoadingSpinner,
  Divider,
} from "@codeatlas/ui";
import { validateGitHubUrl } from "@codeatlas/utils";
import { useGraphStore } from "../features/graph/store";

import dynamic from "next/dynamic";

const VisualizerWorkbench = dynamic(
  () =>
    import("../features/graph/components/VisualizerWorkbench").then(
      (mod) => mod.VisualizerWorkbench,
    ),
  {
    loading: () => (
      <div className="flex-grow h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-[#757575] font-montserrat">
        <LoadingSpinner size="lg" className="mb-4" />
        <span className="text-xs">Mounting interactive visualizer layout...</span>
      </div>
    ),
    ssr: false,
  },
);

const EXAMPLES = [
  "facebook/react",
  "vuejs/core",
  "nestjs/nest",
  "tailwindlabs/tailwindcss",
];

const FEATURES = [
  {
    icon: Map,
    title: "Interactive Repository Map",
    description:
      "Navigate your codebase layout like a geography explorer. Zoom, pan, and visual-depth cluster maps represent your file structures.",
  },
  {
    icon: GitFork,
    title: "Dependency Visualization",
    description:
      "Instantly trace imports and exports across modules. Highlight directional code paths to isolate critical connections.",
  },
  {
    icon: BarChart2,
    title: "Repository Statistics",
    description:
      "Get immediate metrics on file sizes, folder depths, code lines, language ratios, and external dependencies.",
  },
  {
    icon: SearchIcon,
    title: "Instant Search",
    description:
      "Fuzzy search through thousands of folders and files instantly with auto-pan viewport navigation.",
  },
  {
    icon: Compass,
    title: "Smooth Navigation",
    description:
      "Experience spatial transitions. Selected modules are centered and unrelated boundaries are faded out.",
  },
  {
    icon: Sparkles,
    title: "Premium Experience",
    description:
      "Designed for modern developers. Clean interfaces, dark themes, and responsive rendering engines.",
  },
];

export default function Home() {
  const [url, setUrl] = React.useState("");
  const [urlError, setUrlError] = React.useState<string | null>(null);

  const { repository, loadingState, errorMessage, analyzeRepository, reset } =
    useGraphStore();

  const handleExplore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setUrlError("Please enter a GitHub repository URL");
      return;
    }

    const fullUrl = url.includes("github.com")
      ? url
      : `https://github.com/${url}`;
    if (!validateGitHubUrl(fullUrl)) {
      setUrlError(
        "Invalid GitHub repository URL format. Example: https://github.com/facebook/react",
      );
      return;
    }

    setUrlError(null);
    analyzeRepository(fullUrl);
  };

  const handleSelectExample = (example: string) => {
    setUrl(`https://github.com/${example}`);
    setUrlError(null);
  };

  // Determine stage text for loading modal
  const getLoadingText = () => {
    switch (loadingState) {
      case "analyzing":
        return "Cloning repository and building file analysis...";
      case "loading-graph":
        return "Structuring semantic relationships and file hierarchies...";
      case "rendering":
        return "Mounting interactive canvas layout...";
      default:
        return "Processing codebase...";
    }
  };

  const showLoading = ["analyzing", "loading-graph", "rendering"].includes(
    loadingState,
  );

  // If a repository is successfully loaded and ready, render the Workspace Graph Visualizer
  if (loadingState === "ready" && repository) {
    return <VisualizerWorkbench />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white">
      {/* 1. TOP NAVIGATION */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/8"
      >
        <Container className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer select-none">
            <div className="w-8 h-8 rounded-lg bg-[#4F8CFF] flex items-center justify-center font-bold text-white shadow-[0_4px_12px_rgba(79,140,255,0.3)]">
              C
            </div>
            <span className="font-bold text-lg tracking-wider text-white">
              CodeAtlas
            </span>
          </div>

          <nav className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open("https://github.com", "_blank")}
              className="flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Docs</span>
            </Button>
          </nav>
        </Container>
      </motion.header>

      {/* 2. HERO SECTION */}
      <main className="flex-grow">
        <Section spacing="lg" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <Container className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl"
            >
              <Badge
                variant="info"
                className="mb-6 uppercase tracking-widest text-xs px-3 py-1"
              >
                Milestone 8 Exploration Engine
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight font-sans">
                Visualize Any GitHub <br />
                Repository Like a <span className="text-[#4F8CFF]">Map</span>
              </h1>
              <p className="text-lg text-[#B5B5B5] max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
                Explore modular dependencies and software architecture through
                interactive spatial layout maps. Zoom, search, inspect, and pan
                in real time.
              </p>
            </motion.div>

            {/* URL Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full max-w-xl mb-6"
            >
              <form
                onSubmit={handleExplore}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-grow relative">
                  <Input
                    placeholder="Paste GitHub Repository URL (e.g. facebook/react)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    error={!!urlError}
                    className="h-11 pr-4 bg-[#141414] focus:bg-[#1B1B1B]"
                  />
                  {urlError && (
                    <span className="absolute left-1 top-full mt-1.5 flex items-center gap-1 text-xs text-[#FF5F56] font-medium font-sans">
                      <Info className="w-3.5 h-3.5" />
                      {urlError}
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 flex items-center gap-1.5 select-none shrink-0"
                >
                  <span>Explore Repository</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </motion.div>

            {/* 3. EXAMPLE REPOSITORIES */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 flex flex-col items-center"
            >
              <span className="text-xs text-[#757575] font-sans font-medium uppercase tracking-wider mb-3">
                Or explore popular codebases:
              </span>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    onClick={() => handleSelectExample(example)}
                    className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1B1B1B] border border-white/8 text-[#B5B5B5] hover:text-white text-xs font-medium font-sans transition-all duration-150 cursor-pointer"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          </Container>
        </Section>

        <Divider />

        {/* 4. FEATURES GRID SECTION */}
        <Section spacing="md" className="bg-[#0A0A0A]">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                Architecture Visualizer Features
              </h2>
              <p className="text-[#B5B5B5] max-w-xl mx-auto text-sm">
                Unlock instant navigation, spatial boundaries, code
                relationships, and insights from any public repository.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <Card
                      hoverable
                      className="h-full flex flex-col justify-start"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 flex items-center justify-center mb-5 text-[#4F8CFF]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 font-sans">
                        {feat.title}
                      </h3>
                      <p className="text-[#B5B5B5] text-sm leading-relaxed font-sans">
                        {feat.description}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </Section>
      </main>

      <Divider />

      {/* 5. FOOTER */}
      <footer className="bg-[#0A0A0A] border-t border-white/8 py-8">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-[#757575] font-sans">
            <span>&copy; 2026 CodeAtlas. All rights reserved.</span>
            <span>&bull;</span>
            <span className="font-semibold text-[#4F8CFF]">v1.0.0</span>
          </div>

          <div className="flex items-center space-x-6 text-xs font-medium font-sans">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#B5B5B5] hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[#B5B5B5] hover:text-white transition-colors"
            >
              Documentation
            </a>
          </div>
        </Container>
      </footer>

      {/* SIMULATED LOADING MODAL */}
      <AnimatePresence>
        {showLoading && (
          <Modal isOpen={showLoading} onClose={reset}>
            <div className="flex flex-col items-center text-center py-6 font-montserrat">
              <LoadingSpinner size="lg" className="mb-6" />
              <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                Analyzing Repository
              </h3>
              <p className="text-[#B5B5B5] text-sm max-w-sm leading-normal">
                {getLoadingText()}
              </p>

              {/* Decorative progress bars */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-6 border border-white/5 relative">
                <div
                  className="absolute inset-0 bg-[#4F8CFF] animate-pulse"
                  style={{ width: "60%" }}
                />
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ERROR MODAL */}
      <AnimatePresence>
        {loadingState === "error" && errorMessage && (
          <Modal isOpen={true} onClose={reset}>
            <div className="flex flex-col items-center text-center py-6 font-montserrat">
              <div className="w-12 h-12 rounded-full bg-[#FF5F56]/15 border border-[#FF5F56]/20 flex items-center justify-center mb-4 text-[#FF5F56]">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Analysis Failed
              </h3>
              <p className="text-[#B5B5B5] text-xs max-w-sm leading-normal mb-6">
                {errorMessage}
              </p>
              <Button onClick={reset} size="sm">
                Close
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
