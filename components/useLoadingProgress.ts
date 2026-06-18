"use client";

import { useSyncExternalStore } from "react";
import { DefaultLoadingManager } from "three";

type LoadingProgressSnapshot = {
  active: boolean;
  errors: string[];
  item: string;
  loaded: number;
  progress: number;
  total: number;
};

const INITIAL_SNAPSHOT: LoadingProgressSnapshot = {
  active: false,
  errors: [],
  item: "",
  loaded: 0,
  progress: 0,
  total: 0,
};

let snapshot = INITIAL_SNAPSHOT;
let installed = false;
let notifyScheduled = false;
const listeners = new Set<() => void>();

function getProgress(loaded: number, total: number) {
  if (total <= 0) return loaded > 0 ? 100 : 0;
  return Math.min(100, Math.max(0, (loaded / total) * 100));
}

function emitSoon() {
  if (notifyScheduled) return;
  notifyScheduled = true;

  const flush = () => {
    notifyScheduled = false;
    listeners.forEach((listener) => listener());
  };

  if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
    window.requestAnimationFrame(flush);
  } else {
    setTimeout(flush, 0);
  }
}

function setSnapshot(nextSnapshot: LoadingProgressSnapshot) {
  if (
    snapshot.active === nextSnapshot.active &&
    snapshot.item === nextSnapshot.item &&
    snapshot.loaded === nextSnapshot.loaded &&
    snapshot.progress === nextSnapshot.progress &&
    snapshot.total === nextSnapshot.total &&
    snapshot.errors === nextSnapshot.errors
  ) {
    return;
  }

  snapshot = nextSnapshot;
  emitSoon();
}

function installLoadingManagerHandlers() {
  if (installed) return;
  installed = true;

  // Own these callbacks directly instead of @react-three/drei's useProgress.
  // Drei updates a Zustand store synchronously from LoadingManager.itemEnd,
  // which can trip React's maximum-update-depth guard while assets resolve
  // during Canvas commits. This store notifies React on the next frame instead.
  DefaultLoadingManager.onStart = (item, loaded, total) => {
    setSnapshot({
      ...snapshot,
      active: true,
      item,
      loaded,
      total,
      progress: getProgress(loaded, total),
    });
  };

  DefaultLoadingManager.onProgress = (item, loaded, total) => {
    setSnapshot({
      ...snapshot,
      active: true,
      item,
      loaded,
      total,
      progress: getProgress(loaded, total),
    });
  };

  DefaultLoadingManager.onLoad = () => {
    setSnapshot({
      ...snapshot,
      active: false,
      progress: 100,
    });
  };

  DefaultLoadingManager.onError = (item) => {
    setSnapshot({
      ...snapshot,
      active: false,
      errors: [...snapshot.errors, item],
      item,
    });
  };
}

function subscribe(listener: () => void) {
  installLoadingManagerHandlers();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return INITIAL_SNAPSHOT;
}

installLoadingManagerHandlers();

export default function useLoadingProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
