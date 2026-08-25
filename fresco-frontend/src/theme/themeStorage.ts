import { ThemeMode } from "./theme.types";

const THEME_MODE_STORAGE_KEY = "fresco_app_theme_mode";

// In-memory cache for fast synchronous access & node/test fallback
let inMemoryThemeMode: ThemeMode | null = null;

// Safe dynamic accessor for expo-secure-store and react-native Platform
let secureStoreModule: typeof import("expo-secure-store") | null = null;
let platformOS = "native";

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  secureStoreModule = require("expo-secure-store");
} catch {
  secureStoreModule = null;
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Platform } = require("react-native");
  platformOS = Platform?.OS || "native";
} catch {
  platformOS = "node";
}

export const themeStorage = {
  /**
   * Save the user's selected theme mode preference.
   */
  async saveThemeMode(mode: ThemeMode): Promise<void> {
    inMemoryThemeMode = mode;
    try {
      if (platformOS !== "web" && platformOS !== "node" && secureStoreModule) {
        await secureStoreModule.setItemAsync(THEME_MODE_STORAGE_KEY, mode);
      }
    } catch (error) {
      console.warn("Error saving theme mode to storage:", error);
    }
  },

  /**
   * Get the stored theme mode preference. Defaults to 'system'.
   */
  async getThemeMode(): Promise<ThemeMode> {
    if (inMemoryThemeMode) {
      return inMemoryThemeMode;
    }
    try {
      if (platformOS !== "web" && platformOS !== "node" && secureStoreModule) {
        const stored = await secureStoreModule.getItemAsync(THEME_MODE_STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
          inMemoryThemeMode = stored as ThemeMode;
          return stored as ThemeMode;
        }
      }
    } catch (error) {
      console.warn("Error getting theme mode from storage:", error);
    }
    inMemoryThemeMode = "system";
    return "system";
  },

  /**
   * Synchronously get cached theme mode (or 'system' if not yet loaded).
   */
  getCachedThemeMode(): ThemeMode {
    return inMemoryThemeMode || "system";
  },

  /**
   * Reset theme mode cache (useful in tests).
   */
  clearCache(): void {
    inMemoryThemeMode = null;
  },
};
