"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Info } from "lucide-react";
import { Button } from "@codeatlas/ui";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center font-montserrat select-none">
          <div className="w-14 h-14 rounded-full bg-[#FF5F56]/15 border border-[#FF5F56]/20 flex items-center justify-center mb-6 text-[#FF5F56]">
            <Info className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-xs text-[#757575] max-w-sm leading-normal mb-6 font-mono break-all">
            {this.state.error?.message || "An unexpected client-side rendering error occurred."}
          </p>
          <Button onClick={this.handleReset} size="sm">
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
