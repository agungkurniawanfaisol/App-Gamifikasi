import Image from "next/image";
import Link from "next/link";
import brandLogo from "../../../public/logo.png";
import { BRAND_LOGO_SIZE, type BrandLogoSize } from "@/lib/brand";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function BrandLogo({
  size = "md",
  className,
  priority = false,
}: {
  size?: BrandLogoSize;
  className?: string;
  priority?: boolean;
}) {
  const dimension = BRAND_LOGO_SIZE[size];

  return (
    <Image
      src={brandLogo}
      alt={labels.nav.brand}
      width={dimension}
      height={dimension}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: dimension, height: dimension }}
    />
  );
}

export function BrandMark({
  subtitle,
  collapsed = false,
  priority = false,
  href,
  className,
}: {
  subtitle?: string;
  collapsed?: boolean;
  priority?: boolean;
  href?: string;
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "flex items-center",
        collapsed ? "justify-center" : "gap-3",
        className
      )}
    >
      <BrandLogo
        size={collapsed ? "sm" : "md"}
        priority={priority}
        className={cn(!collapsed && "transition-transform group-hover:scale-105")}
      />
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {labels.nav.brand}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group min-w-0 shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
