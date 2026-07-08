"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useBreadcrumbs } from "@/components/layout/breadcrumb-context";
import {
  UserProfileMenu,
  type HeaderProfileUser,
} from "@/components/layout/user-profile-menu";
import { getResponsiveBreadcrumbItems } from "@/lib/breadcrumbs";
import { labels } from "@/lib/labels";

function BreadcrumbNav() {
  const { items } = useBreadcrumbs();

  if (items.length === 0) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <BrandLogo size="sm" />
        <span className="truncate text-sm font-semibold">{labels.nav.brand}</span>
      </div>
    );
  }

  const { visible, collapsed } = getResponsiveBreadcrumbItems(items);

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {collapsed.length > 0 && (
          <>
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbEllipsis className="size-7" />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
          </>
        )}
        {visible.map((item, index) => {
          const isLast = index === visible.length - 1;
          const showSeparator = index > 0 || collapsed.length > 0;

          return (
            <span key={`${item.label}-${index}`} className="contents">
              {showSeparator && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                {isLast || item.isCurrent || !item.href ? (
                  <BreadcrumbPage className="truncate max-w-[10rem] sm:max-w-[14rem]">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className="truncate max-w-[8rem] sm:max-w-[12rem]"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AppTopHeader({
  onMenuClick,
  headerProfile,
  mobileActions,
}: {
  onMenuClick: () => void;
  headerProfile?: HeaderProfileUser;
  mobileActions?: React.ReactNode;
}) {
  const { actions } = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-background/95 px-4 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/85 sm:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="min-h-11 min-w-11 shrink-0 lg:hidden"
        aria-label={labels.nav.openMenu}
        onClick={onMenuClick}
      >
        <Menu className="size-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <BreadcrumbNav />
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {(mobileActions || actions) && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {mobileActions}
            {actions}
          </div>
        )}
        {headerProfile && (mobileActions || actions) && (
          <div
            className="hidden h-8 w-px shrink-0 bg-border/80 sm:block"
            aria-hidden
          />
        )}
        {headerProfile && <UserProfileMenu user={headerProfile} />}
      </div>
    </header>
  );
}
