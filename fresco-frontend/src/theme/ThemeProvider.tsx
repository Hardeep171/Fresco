import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useColorScheme, Appearance } from "react-native";
import { ThemeMode, Theme, ThemeContextValue } from "./theme.types";
import { lightTheme, lightColors } from "./lightTheme";
import { darkTheme } from "./darkTheme";
import { themeStorage } from "./themeStorage";

export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  colors: lightColors,
  isDark: false,
  mode: "system",
  systemColorScheme: "light",
  setThemeMode: async () => {},
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode,
}) => {
  // Device color scheme ("light" | "dark" | null)
  const deviceColorScheme = useColorScheme();
  const [systemScheme, setSystemScheme] = useState<"light" | "dark">(
    deviceColorScheme === "dark" || Appearance.getColorScheme() === "dark"
      ? "dark"
      : "light"
  );

  // User preference: "light" | "dark" | "system"
  const [mode, setModeState] = useState<ThemeMode>(
    initialMode || themeStorage.getCachedThemeMode()
  );

  // Load saved theme mode from storage on mount
  useEffect(() => {
    if (!initialMode) {
      themeStorage.getThemeMode().then((savedMode) => {
        setModeState(savedMode);
      });
    }
  }, [initialMode]);

  // Listen to live system OS appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Update system scheme if hook provides new value
  useEffect(() => {
    if (deviceColorScheme === "dark" || deviceColorScheme === "light") {
      setSystemScheme(deviceColorScheme);
    }
  }, [deviceColorScheme]);

  // Resolve whether dark mode is currently active
  const isDark = useMemo(() => {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return systemScheme === "dark";
  }, [mode, systemScheme]);

  // Compute active theme and colors
  const activeTheme: Theme = useMemo(() => {
    const base = isDark ? darkTheme : lightTheme;
    return {
      ...base,
      mode,
      isDark,
    };
  }, [isDark, mode]);

  // User action to set theme mode
  const setThemeMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    await themeStorage.saveThemeMode(newMode);
  }, []);

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      theme: activeTheme,
      colors: activeTheme.colors,
      isDark,
      mode,
      systemColorScheme: systemScheme,
      setThemeMode,
    }),
    [activeTheme, isDark, mode, systemScheme, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
