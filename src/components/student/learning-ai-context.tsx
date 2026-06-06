"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "learning-ai-panel-collapsed";

type LearningAiPanelContextValue = {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const LearningAiPanelContext = createContext<LearningAiPanelContextValue | null>(
  null
);

export function LearningAiPanelProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <LearningAiPanelContext.Provider
      value={{ collapsed, toggle, mobileOpen, setMobileOpen }}
    >
      {children}
    </LearningAiPanelContext.Provider>
  );
}

export function useLearningAiPanel() {
  const context = useContext(LearningAiPanelContext);
  if (!context) {
    throw new Error(
      "useLearningAiPanel must be used within LearningAiPanelProvider"
    );
  }
  return context;
}
