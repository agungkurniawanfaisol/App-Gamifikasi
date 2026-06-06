"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppTopHeader } from "@/components/layout/app-top-header";
import type { HeaderProfileUser } from "@/components/layout/user-profile-menu";
import { BreadcrumbProvider } from "@/components/layout/breadcrumb-context";
import { PageLayoutProvider, usePageLayout } from "@/components/layout/page-layout-context";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

function MobileNavSheet({
  open,
  onOpenChange,
  sidebar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sidebar: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex h-full flex-col p-0 pb-safe w-[min(20rem,85vw)] border-sidebar-border bg-sidebar [&>button]:right-3 [&>button]:top-3"
      >
        <SheetTitle className="sr-only">{labels.nav.menu}</SheetTitle>
        <div className="flex h-full min-h-0 flex-col overflow-hidden">{sidebar}</div>
      </SheetContent>
    </Sheet>
  );
}

function AppShellInner({
  sidebar,
  children,
  className,
  headerProfile,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerProfile?: HeaderProfileUser;
}) {
  const { collapsed, toggle } = useSidebar();
  const { fullWidth } = usePageLayout();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden transition-[width] duration-200 ease-in-out lg:block",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <aside className="h-full overflow-hidden border-r border-sidebar-border bg-sidebar">
          {sidebar}
        </aside>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label={
            collapsed ? labels.nav.expandSidebar : labels.nav.collapseSidebar
          }
          className="absolute right-0 top-6 z-50 size-7 translate-x-1/2 rounded-full border-border bg-background shadow-md hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </Button>
      </div>

      <MobileNavSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        sidebar={sidebar}
      />

      <main
        className={cn(
          "flex h-dvh flex-col overflow-hidden transition-[margin-left] duration-200 ease-in-out",
          "ml-0 lg:ml-16",
          !collapsed && "lg:ml-64",
          className
        )}
      >
        <BreadcrumbProvider>
          <AppTopHeader
            onMenuClick={() => setMobileOpen(true)}
            headerProfile={headerProfile}
          />

          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30">
            <div
              className={cn(
                "mx-auto w-full animate-fade-in p-4 sm:p-6 md:p-8",
                fullWidth ? "max-w-none" : "max-w-6xl"
              )}
            >
              {children}
            </div>
          </div>
        </BreadcrumbProvider>
      </main>
    </div>
  );
}

export function AppShell({
  sidebar,
  children,
  className,
  headerProfile,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerProfile?: HeaderProfileUser;
}) {
  return (
    <TooltipProvider delayDuration={250}>
      <SidebarProvider>
        <PageLayoutProvider>
          <AppShellInner
            sidebar={sidebar}
            className={className}
            headerProfile={headerProfile}
          >
            {children}
          </AppShellInner>
        </PageLayoutProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}
