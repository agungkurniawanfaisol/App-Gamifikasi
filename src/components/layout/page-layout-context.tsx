"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PageLayoutContextValue = {
  fullWidth: boolean;
  setFullWidth: (value: boolean) => void;
};

const PageLayoutContext = createContext<PageLayoutContextValue | null>(null);

export function PageLayoutProvider({ children }: { children: ReactNode }) {
  const [fullWidth, setFullWidthState] = useState(false);

  const setFullWidth = useCallback((value: boolean) => {
    setFullWidthState(value);
  }, []);

  const value = useMemo(
    () => ({ fullWidth, setFullWidth }),
    [fullWidth, setFullWidth]
  );

  return (
    <PageLayoutContext.Provider value={value}>
      {children}
    </PageLayoutContext.Provider>
  );
}

export function usePageLayout() {
  const context = useContext(PageLayoutContext);
  if (!context) {
    throw new Error("usePageLayout must be used within PageLayoutProvider");
  }
  return context;
}
