"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  applyBreadcrumbOverrides,
  buildBreadcrumbsFromPath,
  type BreadcrumbItem,
} from "@/lib/breadcrumbs";

type BreadcrumbContextValue = {
  items: BreadcrumbItem[];
  setOverrides: (overrides: Record<string, string>) => void;
  setActions: (actions: ReactNode | null) => void;
  actions: ReactNode | null;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [overrides, setOverridesState] = useState<Record<string, string>>({});
  const [actions, setActionsState] = useState<ReactNode | null>(null);

  const setOverrides = useCallback((next: Record<string, string>) => {
    setOverridesState(next);
  }, []);

  const setActions = useCallback((next: ReactNode | null) => {
    setActionsState(next);
  }, []);

  const items = useMemo(() => {
    const base = buildBreadcrumbsFromPath(pathname);
    return applyBreadcrumbOverrides(base, overrides);
  }, [pathname, overrides]);

  const value = useMemo(
    () => ({ items, setOverrides, setActions, actions }),
    [items, setOverrides, setActions, actions]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbs must be used within BreadcrumbProvider");
  }
  return context;
}
