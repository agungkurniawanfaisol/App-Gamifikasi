"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppTopHeader } from "@/components/layout/app-top-header";
import type { HeaderProfileUser } from "@/components/layout/user-profile-menu";
import { BreadcrumbProvider } from "@/components/layout/breadcrumb-context";
import { PageLayoutProvider, usePageLayout } from "@/components/layout/page-layout-context";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import {
  AiChatScopeProvider,
  type AiChatMessage,
} from "@/components/layout/ai-chat-scope-context";
import { DashboardAiPanelProvider, useDashboardAiPanel } from "@/components/layout/dashboard-ai-context";
import {
  DashboardAiMobileButton,
  DashboardAiRail,
} from "@/components/layout/dashboard-ai-rail";
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
  enableAiRail = false,
  aiCollapsed = true,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerProfile?: HeaderProfileUser;
  enableAiRail?: boolean;
  aiCollapsed?: boolean;
}) {
  const { collapsed, toggle } = useSidebar();
  const { fullWidth } = usePageLayout();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-dvh overflow-hidden bg-background">
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

      {enableAiRail && (
        <div className="fixed inset-y-0 right-0 z-50 hidden h-dvh px-1 py-2 lg:block">
          <DashboardAiRail />
        </div>
      )}

      <MobileNavSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        sidebar={sidebar}
      />

      <main
        className={cn(
          "flex h-dvh flex-col overflow-hidden transition-[margin] duration-200 ease-in-out",
          "ml-0 lg:ml-16",
          !collapsed && "lg:ml-64",
          enableAiRail && (aiCollapsed ? "lg:mr-12" : "lg:mr-72 xl:mr-[22rem]"),
          className
        )}
      >
        <BreadcrumbProvider>
          <AppTopHeader
            onMenuClick={() => setMobileOpen(true)}
            headerProfile={headerProfile}
            mobileActions={enableAiRail ? <DashboardAiMobileButton /> : undefined}
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

function AppShellWithAi({
  generalChatMessages,
  ...props
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerProfile?: HeaderProfileUser;
  generalChatMessages: AiChatMessage[];
}) {
  return (
    <DashboardAiPanelProvider>
      <AiChatScopeProvider defaultMessages={generalChatMessages}>
        <AppShellInnerWithAi {...props} />
      </AiChatScopeProvider>
    </DashboardAiPanelProvider>
  );
}

function AppShellInnerWithAi(
  props: {
    sidebar: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    headerProfile?: HeaderProfileUser;
  }
) {
  const { collapsed: aiCollapsed } = useDashboardAiPanel();
  return (
    <AppShellInner enableAiRail aiCollapsed={aiCollapsed} {...props} />
  );
}

export function AppShell({
  sidebar,
  children,
  className,
  headerProfile,
  enableAiRail = false,
  generalChatMessages = [],
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerProfile?: HeaderProfileUser;
  enableAiRail?: boolean;
  generalChatMessages?: AiChatMessage[];
}) {
  const shell = enableAiRail ? (
    <AppShellWithAi
      sidebar={sidebar}
      className={className}
      headerProfile={headerProfile}
      generalChatMessages={generalChatMessages}
    >
      {children}
    </AppShellWithAi>
  ) : (
    <AppShellInner
      sidebar={sidebar}
      className={className}
      headerProfile={headerProfile}
    >
      {children}
    </AppShellInner>
  );

  return (
    <TooltipProvider delayDuration={250}>
      <SidebarProvider>
        <PageLayoutProvider>{shell}</PageLayoutProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}
