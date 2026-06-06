"use client";

import { useEffect } from "react";
import { useBreadcrumbs } from "@/components/layout/breadcrumb-context";

export function SetBreadcrumbs({
  overrides,
}: {
  overrides: Record<string, string>;
}) {
  const { setOverrides } = useBreadcrumbs();

  const overrideKey = JSON.stringify(overrides);

  useEffect(() => {
    setOverrides(JSON.parse(overrideKey) as Record<string, string>);
    return () => setOverrides({});
  }, [overrideKey, setOverrides]);

  return null;
}
