import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Baseline reference dimensions (standard modern smartphone 375x812 pt)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scales a dimension horizontally relative to standard screen width.
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scales a dimension vertically relative to standard screen height.
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderately scales a dimension using a resizing factor (default 0.5)
 * to avoid overly large components on tablets or large phones.
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Scalable font size calculation respecting device pixel ratio.
 */
export const fontScale = (size: number): number => {
  const newSize = (SCREEN_WIDTH / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const windowDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isLargeDevice: SCREEN_WIDTH >= 414,
} as const;
