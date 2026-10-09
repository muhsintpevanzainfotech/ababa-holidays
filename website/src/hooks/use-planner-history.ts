import { useCallback, useState } from "react";
import type { UIMessage } from "ai";

export type PlannerDestination = { destination: string; country: string; latitude: number; longitude: number; highlights: string[] };
export type PlannerThread = { id: string; title: string; updatedAt: number; messages: UIMessage[]; destination?: PlannerDestination };

const STORAGE_KEY = "global-travel-hub-planner-threads";

const newThread = (): PlannerThread => ({ id: crypto.randomUUID(), title: "New Kerala trip", updatedAt: Date.now(), messages: [] });

function loadThreads(): PlannerThread[] {
  if (typeof window === "undefined") return [newThread()];
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as PlannerThread[];
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch { /* start fresh when storage is invalid */ }
  const initial = [newThread()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function usePlannerHistory() {
  const [threads, setThreads] = useState<PlannerThread[]>(loadThreads);
  const persist = useCallback((updater: (current: PlannerThread[]) => PlannerThread[]) => {
    setThreads((current) => {
      const next = updater(current);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const createThread = useCallback(() => {
    const thread = newThread();
    persist((current) => [thread, ...current]);
    return thread;
  }, [persist]);
  const updateThread = useCallback((id: string, patch: Partial<Omit<PlannerThread, "id">>) => {
    persist((current) => current.map((thread) => thread.id === id ? { ...thread, ...patch, updatedAt: Date.now() } : thread).sort((a, b) => b.updatedAt - a.updatedAt));
  }, [persist]);
  const deleteThread = useCallback((id: string) => {
    let nextId = "";
    persist((current) => {
      const remaining = current.filter((thread) => thread.id !== id);
      if (remaining.length > 0) { nextId = remaining[0].id; return remaining; }
      const replacement = newThread(); nextId = replacement.id; return [replacement];
    });
    return nextId;
  }, [persist]);
  return { threads, createThread, updateThread, deleteThread };
}
