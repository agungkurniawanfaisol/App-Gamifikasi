"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavLink } from "@/components/layout/nav-link";
import { useSidebarRailCollapsed } from "@/components/layout/sidebar-context";
import {
  isNavGroupActive,
  isNavLeafActive,
  type NavGroup,
  type NavLeaf,
  type NavTreeItem,
} from "@/lib/nav-config";
import { cn } from "@/lib/utils";

function NavLeafLink({
  item,
  nested = false,
}: {
  item: NavLeaf;
  nested?: boolean;
}) {
  return (
    <NavLink
      href={item.href}
      label={item.label}
      icon={item.icon}
      exact={item.exact}
      className={nested ? "pl-9" : undefined}
    />
  );
}

function CollapsedGroupMenu({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const active = isNavGroupActive(pathname, group);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={group.label}
          title={group.label}
          className={cn(
            "relative flex min-h-11 w-full items-center justify-center rounded-md p-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <group.icon className="size-4 shrink-0" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="min-w-44">
        {group.children.map((child) => {
          const childActive = isNavLeafActive(
            pathname,
            child.href,
            child.exact
          );
          return (
            <DropdownMenuItem key={child.href} asChild>
              <Link
                href={child.href}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2",
                  childActive && "bg-accent font-medium"
                )}
              >
                <child.icon className="size-4 shrink-0" aria-hidden />
                {child.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ExpandedGroupSection({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const active = isNavGroupActive(pathname, group);
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active, pathname]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        type="button"
        aria-expanded={open}
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <group.icon className="size-4 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 space-y-0.5">
        {group.children.map((child) => (
          <NavLeafLink key={child.href} item={child} nested />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function NavTree({ items }: { items: NavTreeItem[] }) {
  const showCollapsedRail = useSidebarRailCollapsed();

  const content = useMemo(
    () =>
      items.map((item) => {
        if (item.kind === "leaf") {
          return <NavLeafLink key={item.href} item={item} />;
        }

        if (showCollapsedRail) {
          return <CollapsedGroupMenu key={item.id} group={item} />;
        }

        return <ExpandedGroupSection key={item.id} group={item} />;
      }),
    [showCollapsedRail, items]
  );

  return <div className="flex flex-col gap-1">{content}</div>;
}
