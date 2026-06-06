"use client";

import { useEffect } from "react";
import { usePageLayout } from "@/components/layout/page-layout-context";

export function SetPageLayout({ fullWidth }: { fullWidth?: boolean }) {
  const { setFullWidth } = usePageLayout();

  useEffect(() => {
    setFullWidth(fullWidth ?? false);
    return () => setFullWidth(false);
  }, [fullWidth, setFullWidth]);

  return null;
}
