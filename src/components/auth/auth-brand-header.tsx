import Image from "next/image";
import brandLogo from "../../../public/logo.png";
import kementrianLogo from "../../../public/partners/kementrian.png";
import unipdaLogo from "../../../public/partners/unipda.png";
import unipdaDarkLogo from "../../../public/partners/unipda-dark.png";
import diktiLogo from "../../../public/partners/dikti.png";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const AUTH_LOGOS = [
  {
    id: "kementrian",
    src: kementrianLogo,
    alt: labels.landing.hero.ministryBrand,
    className: "h-10 w-10 sm:h-11 sm:w-11",
  },
  {
    id: "unipda",
    src: unipdaLogo,
    darkSrc: unipdaDarkLogo,
    alt: labels.nav.partnerBrand,
    className: "h-10 w-28 sm:h-11 sm:w-32",
  },
  {
    id: "deeptest",
    src: brandLogo,
    alt: labels.nav.brand,
    className: "h-14 w-14 sm:h-16 sm:w-16",
  },
  {
    id: "dikti",
    src: diktiLogo,
    alt: labels.landing.hero.diktiBrand,
    className: "h-9 w-auto max-w-[7.5rem] sm:h-10 sm:max-w-[9rem]",
  },
] as const;

/**
 * Compact partner logo row for auth screens (login / register / password reset).
 * Same order as landing: Kementrian → UNIPDA → Deeptest → Dikti.
 */
export function AuthBrandHeader({
  priority = false,
  align = "center",
  showTitle = true,
  className,
}: {
  priority?: boolean;
  align?: "center" | "start";
  showTitle?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 sm:gap-4",
          align === "center" ? "justify-center" : "justify-start"
        )}
        role="group"
        aria-label={labels.landing.hero.partnerStripAria}
      >
        {AUTH_LOGOS.map((logo, index) => (
          <div key={logo.id} className="flex items-center gap-3 sm:gap-4">
            {index > 0 ? (
              <span
                className={cn(
                  "hidden w-px shrink-0 bg-border/70 sm:block",
                  logo.id === "deeptest" || AUTH_LOGOS[index - 1]?.id === "deeptest"
                    ? "h-10"
                    : "h-8"
                )}
                aria-hidden="true"
              />
            ) : null}
            {"darkSrc" in logo ? (
              <span className={cn("relative block shrink-0", logo.className)}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  priority={priority}
                  sizes="(max-width: 640px) 112px, 128px"
                  className="object-contain dark:hidden"
                />
                <Image
                  src={logo.darkSrc}
                  alt=""
                  fill
                  priority={priority}
                  sizes="(max-width: 640px) 112px, 128px"
                  className="hidden object-contain dark:block"
                  aria-hidden="true"
                />
              </span>
            ) : (
              <Image
                src={logo.src}
                alt={logo.alt}
                width={64}
                height={64}
                priority={priority}
                className={cn("shrink-0 object-contain", logo.className)}
              />
            )}
          </div>
        ))}
      </div>
      {showTitle ? (
        <div className="min-w-0 space-y-0.5">
          <p className="text-lg font-semibold tracking-tight sm:text-xl">
            {labels.nav.brand}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {labels.login.subtitle}
          </p>
        </div>
      ) : null}
    </div>
  );
}
