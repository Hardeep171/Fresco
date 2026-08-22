const ACCESS_TOKEN_KEY = "fresco_access_token";
const REFRESH_TOKEN_KEY = "fresco_refresh_token";

// Memory cache for synchronous fast access
let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

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

export const secureStorage = {
  /**
   * Save access and refresh tokens securely.
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    inMemoryAccessToken = accessToken;
    inMemoryRefreshToken = refreshToken;
    try {
      if (platformOS !== "web" && platformOS !== "node" && secureStoreModule) {
        await secureStoreModule.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await secureStoreModule.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.warn("Error saving tokens to SecureStore:", error);
    }
  },

  /**
   * Get the stored access token.
   */
  async getAccessToken(): Promise<string | null> {
    if (inMemoryAccessToken) {
      return inMemoryAccessToken;
    }
    try {
      if (platformOS !== "web" && platformOS !== "node" && secureStoreModule) {
        inMemoryAccessToken = await secureStoreModule.getItemAsync(ACCESS_TOKEN_KEY);
      }
      return inMemoryAccessToken;
    } catch (error) {
      console.warn("Error getting access token from SecureStore:", error);
      return null;
    }
  },

  /**
   * Get the stored refresh token.
   */
  async getRefreshToken(): Promise<string | null> {
    if (inMemoryRefreshToken) {
      return inMemoryRefreshToken;
    }
    try {
      if (platformOS !== "web" && platformOS !== "node" && secureStoreModule) {
        inMemoryRefreshToken = await secureStoreModule.getItemAsync(REFRESH_TOKEN_KEY);
      }
      return inMemoryRefreshToken;
    } catch (error) {
      console.warn("Error getting refresh token from SecureStore:", error);
      return null;
    }
  },

  /**
   * Clear all stored authentication tokens upon logout or session expiry.
   */
  async clearTokens(): Promise<void> {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    try {
      if (platformOS !== "web" && platformOS !== "node" && secureStoreModule) {
        await secureStoreModule.deleteItemAsync(ACCESS_TOKEN_KEY);
        await secureStoreModule.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.warn("Error clearing tokens from SecureStore:", error);
    }
  },
};
