import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { shadows } from "./shadows";

/**
 * Unified Theme object for FRESCO mobile application.
 * All UI components should import and consume properties from this theme.
 */
export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} as const;

export type Theme = typeof theme;

export { colors } from "./colors";
export { typography } from "./typography";
export { spacing } from "./spacing";
export { radius } from "./radius";
export { shadows } from "./shadows";
