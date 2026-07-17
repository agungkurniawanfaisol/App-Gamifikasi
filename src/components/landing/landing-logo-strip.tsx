import Image from "next/image";
import brandLogo from "../../../public/logo.png";
import kementrianLogo from "../../../public/partners/kementrian.png";
import unipdaLogo from "../../../public/partners/unipda.png";
import unipdaDarkLogo from "../../../public/partners/unipda-dark.png";
import diktiLogo from "../../../public/partners/dikti.png";
import {
  LANDING_LOGO_STRIP,
  LANDING_STRIP_HEIGHT,
  type LandingLogoId,
} from "@/lib/brand";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const LOGO_SRC = {
  kementrian: kementrianLogo,
  unipda: unipdaLogo,
  deeptest: brandLogo,
  dikti: diktiLogo,
} as const;

function logoAlt(id: LandingLogoId): string {
  switch (id) {
    case "kementrian":
      return labels.landing.hero.ministryBrand;
    case "unipda":
      return labels.nav.partnerBrand;
    case "deeptest":
      return labels.nav.brand;
    case "dikti":
      return labels.landing.hero.diktiBrand;
  }
}

function slotClass(id: LandingLogoId, isBrand: boolean): string {
  if (isBrand) {
    return "h-[4.5rem] w-[4.5rem] sm:h-24 sm:w-24 md:h-[6.5rem] md:w-[6.5rem]";
  }
  if (id === "unipda") {
    // Horizontal crest + wordmark; wide enough for readable text.
    return "h-14 w-[9.75rem] sm:h-16 sm:w-[11rem] md:h-[4.25rem] md:w-[12rem]";
  }
  if (id === "dikti") {
    // Landscape mark — same height as other partners, width grows from aspect
    return "h-14 w-auto min-w-[7.5rem] sm:h-16 sm:min-w-[9rem] md:h-[4.25rem] md:min-w-[10.5rem]";
  }
  // Square partner seals (Kementrian, UNIPDA) — equal size
  return "h-14 w-14 sm:h-16 sm:w-16 md:h-[4.25rem] md:w-[4.25rem]";
}

/**
 * Partner institution strip for the landing hero.
 * Equal partner heights; Deeptest remains the focal (slightly larger) mark.
 */
export function LandingLogoStrip({
  priority = false,
  className,
}: {
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-5xl",
        "overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "md:overflow-visible",
        className
      )}
      role="group"
      aria-label={labels.landing.hero.partnerStripAria}
    >
      <ul
        className={cn(
          "mx-auto flex min-w-max list-none items-center justify-center",
          "gap-4 px-2 sm:gap-5 md:min-w-0 md:gap-6 lg:gap-8"
        )}
      >
        {LANDING_LOGO_STRIP.map((item, index) => {
          const height = LANDING_STRIP_HEIGHT[item.heightKey];
          const width = Math.round(height * item.aspect);
          const isBrand = Boolean(item.isBrand);

          return (
            <li
              key={item.id}
              className="flex shrink-0 snap-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8"
            >
              {index > 0 ? (
                <span
                  className={cn(
                    "hidden w-px shrink-0 bg-border/60 sm:block",
                    isBrand || LANDING_LOGO_STRIP[index - 1]?.isBrand
                      ? "h-12 md:h-14"
                      : "h-10 md:h-12"
                  )}
                  aria-hidden="true"
                />
              ) : null}

              <div
                className={cn(
                  "relative flex items-center justify-center",
                  slotClass(item.id, isBrand)
                )}
              >
                {item.id === "unipda" ? (
                  <>
                    <Image
                      src={unipdaLogo}
                      alt={logoAlt(item.id)}
                      width={width}
                      height={height}
                      priority={priority}
                      sizes="(max-width: 640px) 156px, 192px"
                      className="h-full w-full object-contain dark:hidden"
                    />
                    <Image
                      src={unipdaDarkLogo}
                      alt=""
                      width={width}
                      height={height}
                      priority={priority}
                      sizes="(max-width: 640px) 156px, 192px"
                      className="hidden h-full w-full object-contain dark:block"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <Image
                    src={LOGO_SRC[item.id]}
                    alt={logoAlt(item.id)}
                    width={width}
                    height={height}
                    priority={priority}
                    sizes={
                      isBrand
                        ? "(max-width: 640px) 72px, 104px"
                        : item.id === "dikti"
                          ? "(max-width: 640px) 150px, 200px"
                          : "(max-width: 640px) 56px, 68px"
                    }
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
