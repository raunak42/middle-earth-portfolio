"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type SceneErrorBoundaryProps = {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey: number;
};

type SceneErrorBoundaryState = {
  error: Error | null;
  resetKey: number;
};

export default class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = {
    error: null,
    resetKey: this.props.resetKey,
  };

  static getDerivedStateFromError(error: Error): Partial<SceneErrorBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(
    props: SceneErrorBoundaryProps,
    state: SceneErrorBoundaryState,
  ): Partial<SceneErrorBoundaryState> | null {
    if (props.resetKey !== state.resetKey) {
      return {
        error: null,
        resetKey: props.resetKey,
      };
    }

    return null;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error);
    }

    return this.props.children;
  }
}
