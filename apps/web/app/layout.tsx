import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CodeAtlas | Interactive GitHub Repository Visualization",
  description:
    "Visualize and explore any GitHub repository as an interactive map. Analyze file structures, semantic code architectures, and dependencies instantly.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  keywords: [
    "GitHub",
    "visualizer",
    "repository map",
    "codebase explorer",
    "AST analysis",
    "dependency graph",
    "software architecture",
  ],
  openGraph: {
    title: "CodeAtlas | Interactive GitHub Repository Visualization",
    description:
      "Visualize and explore any GitHub repository as an interactive map.",
    url: "https://codeatlas.dev",
    siteName: "CodeAtlas",
    images: [
      {
        url: "https://codeatlas.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "CodeAtlas Repository Map Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeAtlas | Interactive GitHub Repository Visualization",
    description:
      "Visualize and explore any GitHub repository as an interactive map.",
    images: ["https://codeatlas.dev/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ErrorBoundary } from "../features/common/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${montserrat.variable} font-sans antialiased bg-[#0A0A0A] text-white h-full`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
