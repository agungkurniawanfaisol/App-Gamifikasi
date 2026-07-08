import Image from "next/image";
import Link from "next/link";
import brandLogo from "../../../public/logo.png";
import partnerLogo from "../../../public/unipda-logo.png";
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

export function PartnerLogo({
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
      src={partnerLogo}
      alt={labels.nav.partnerBrand}
      width={dimension}
      height={dimension}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: dimension, height: dimension }}
    />
  );
}

/** App logo + partner (UNIPDA) logo side by side. */
export function BrandLogoPair({
  size = "lg",
  className,
  priority = false,
}: {
  size?: BrandLogoSize;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 sm:gap-5",
        className
      )}
      aria-label={`${labels.nav.brand} · ${labels.nav.partnerBrand}`}
    >
      <BrandLogo size={size} priority={priority} className="drop-shadow-md" />
      <span
        className={cn(
          "shrink-0 bg-border",
          size === "3xl" || size === "4xl"
            ? "h-14 w-px sm:h-20"
            : "h-10 w-px sm:h-14"
        )}
        aria-hidden="true"
      />
      <PartnerLogo size={size} priority={priority} className="drop-shadow-md" />
    </div>
  );
}

export function BrandMark({
  subtitle,
  collapsed = false,
  priority = false,
  href,
  className,
  showPartner = false,
}: {
  subtitle?: string;
  collapsed?: boolean;
  priority?: boolean;
  href?: string;
  className?: string;
  showPartner?: boolean;
}) {
  const content = (
    <div
      className={cn(
        "flex items-center",
        collapsed ? "justify-center" : "gap-3",
        className
      )}
    >
      {showPartner && !collapsed ? (
        <BrandLogoPair
          size="sm"
          priority={priority}
          className="gap-2 sm:gap-2.5 [&>span]:h-7 sm:[&>span]:h-8"
        />
      ) : (
        <BrandLogo
          size={collapsed ? "sm" : "md"}
          priority={priority}
          className={cn(!collapsed && "transition-transform group-hover:scale-105")}
        />
      )}
      {!collapsed && !showPartner && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {labels.nav.brand}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
      {!collapsed && showPartner && subtitle ? (
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      ) : null}
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
