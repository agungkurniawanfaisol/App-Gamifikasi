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

type DashboardAiPanelContextValue = {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const DashboardAiPanelContext =
  createContext<DashboardAiPanelContextValue | null>(null);

export function DashboardAiPanelProvider({ children }: { children: ReactNode }) {
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
    <DashboardAiPanelContext.Provider
      value={{ collapsed, toggle, mobileOpen, setMobileOpen }}
    >
      {children}
    </DashboardAiPanelContext.Provider>
  );
}

export function useDashboardAiPanel() {
  const context = useContext(DashboardAiPanelContext);
  if (!context) {
    throw new Error(
      "useDashboardAiPanel must be used within DashboardAiPanelProvider"
    );
  }
  return context;
}
