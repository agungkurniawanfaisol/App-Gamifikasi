export const BRAND_LOGO_SRC = "/logo.png";
export const PARTNER_LOGO_SRC = "/logoUnipda.png";

/** UNIPDA horizontal lockup aspect (crest + wordmark). */
export const PARTNER_LOGO_ASPECT = 960 / 342;

export const BRAND_LOGO_SIZE = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 64,
  xl: 96,
  "2xl": 128,
  "3xl": 168,
  "4xl": 208,
} as const;

export type BrandLogoSize = keyof typeof BRAND_LOGO_SIZE;

/**
 * Landing strip heights (px).
 * Partners share one height for visual balance; Deeplink stays slightly larger.
 */
export const LANDING_STRIP_HEIGHT = {
  /** Kementrian, UNIPDA, Dikti — equal visual weight */
  sm: 64,
  /** Deeplink focal logo */
  hero: 96,
} as const;

export type LandingStripHeightKey = keyof typeof LANDING_STRIP_HEIGHT;

export type LandingLogoId = "kementrian" | "unipda" | "deeptest" | "dikti";

export type LandingLogoStripItem = {
  id: LandingLogoId;
  src: string;
  /** width / height */
  aspect: number;
  heightKey: LandingStripHeightKey;
  isBrand?: boolean;
};

/**
 * Landing hero order (left → right): Tutwuri → DiktiSaintek → Deeplink → UNIPDA.
 * Aspects match processed `public/partners/*.png` (+ brand logo).
 */
export const LANDING_LOGO_STRIP: readonly LandingLogoStripItem[] = [
  {
    id: "kementrian",
    src: "/partners/kementrian.png",
    aspect: 1,
    heightKey: "sm",
  },
  {
    id: "dikti",
    src: "/partners/dikti.png",
    aspect: 800 / 236,
    heightKey: "sm",
  },
  {
    id: "deeptest",
    src: BRAND_LOGO_SRC,
    aspect: 507 / 492,
    heightKey: "hero",
    isBrand: true,
  },
  {
    id: "unipda",
    src: "/partners/unipda.png",
    aspect: 960 / 342,
    heightKey: "sm",
  },
] as const;
