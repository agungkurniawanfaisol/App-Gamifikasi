import Image from "next/image";
import Link from "next/link";
import brandLogo from "../../../public/logo.png";
import partnerLogo from "../../../public/logoUnipda.png";
import {
  BRAND_LOGO_SIZE,
  PARTNER_LOGO_ASPECT,
  type BrandLogoSize,
} from "@/lib/brand";
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
  const height = BRAND_LOGO_SIZE[size];
  const width = Math.round(height * PARTNER_LOGO_ASPECT);

  return (
    <Image
      src={partnerLogo}
      alt={labels.nav.partnerBrand}
      width={width}
      height={height}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
      style={{ width, height }}
    />
  );
}

/** Deeptest logo (large) with a smaller UNIPDA partner mark beside it. */
export function BrandLogoPair({
  brandSize = "2xl",
  partnerSize = "sm",
  className,
  priority = false,
}: {
  brandSize?: BrandLogoSize;
  partnerSize?: BrandLogoSize;
  className?: string;
  priority?: boolean;
}) {
  const brandDimension = BRAND_LOGO_SIZE[brandSize];

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 sm:gap-4",
        className
      )}
      aria-label={`${labels.nav.brand} · ${labels.nav.partnerBrand}`}
    >
      <BrandLogo
        size={brandSize}
        priority={priority}
        className="drop-shadow-md"
      />
      <span
        className="w-px shrink-0 bg-border"
        style={{ height: Math.round(brandDimension * 0.72) }}
        aria-hidden="true"
      />
      <PartnerLogo
        size={partnerSize}
        priority={priority}
        className="drop-shadow-sm"
      />
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
          brandSize="md"
          partnerSize="xs"
          priority={priority}
          className="gap-2"
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
