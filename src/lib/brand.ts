export const BRAND_LOGO_SRC = "/logo.png";
export const PARTNER_LOGO_SRC = "/logoUnipda.png";

/** UNIPDA mark is portrait (128×160). */
export const PARTNER_LOGO_ASPECT = 128 / 160;

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
