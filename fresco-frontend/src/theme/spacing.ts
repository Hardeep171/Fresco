/**
 * Centralized spacing scale design tokens based on 4-point/8-point grid.
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  screenPadding: 16,
} as const;

export type Spacing = typeof spacing;
