import { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";
import { ThemeContextValue } from "./theme.types";

/**
 * Custom hook to access active FRESCO theme, colors, dark mode flag, and theme switcher.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
