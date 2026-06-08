export const BRAND_LOGO_SRC = "/logo.png";

export const BRAND_LOGO_SIZE = {
  xs: 28,
  sm: 32,
  md: 36,
  lg: 40,
  xl: 48,
} as const;

export type BrandLogoSize = keyof typeof BRAND_LOGO_SIZE;
