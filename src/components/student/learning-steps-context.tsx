"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "learning-steps-panel-collapsed";

type LearningStepsPanelContextValue = {
  collapsed: boolean;
  toggle: () => void;
};

const LearningStepsPanelContext =
  createContext<LearningStepsPanelContextValue | null>(null);

const LearningStepsCompactContext = createContext(false);

export function LearningStepsCompactScope({
  compact,
  children,
}: {
  compact: boolean;
  children: ReactNode;
}) {
  return (
    <LearningStepsCompactContext.Provider value={compact}>
      {children}
    </LearningStepsCompactContext.Provider>
  );
}

export function useLearningStepsCompact() {
  return useContext(LearningStepsCompactContext);
}

export function LearningStepsPanelProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <LearningStepsPanelContext.Provider value={{ collapsed, toggle }}>
      {children}
    </LearningStepsPanelContext.Provider>
  );
}

export function useLearningStepsPanel() {
  const context = useContext(LearningStepsPanelContext);
  if (!context) {
    throw new Error(
      "useLearningStepsPanel must be used within LearningStepsPanelProvider"
    );
  }
  return context;
}
