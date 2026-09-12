const ACCESS_TOKEN_KEY = "fresco_access_token";
const REFRESH_TOKEN_KEY = "fresco_refresh_token";
const USER_KEY = "fresco_user";

const memoryStore = new Map<string, string>();

const getStore = () => {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    return window.localStorage;
  }
  return {
    getItem: (key: string) => memoryStore.get(key) || null,
    setItem: (key: string, val: string) => memoryStore.set(key, val),
    removeItem: (key: string) => memoryStore.delete(key),
    clear: () => memoryStore.clear(),
  };
};

export const storageService = {
  saveTokens(accessToken: string, refreshToken: string): void {
    try {
      const store = getStore();
      store.setItem(ACCESS_TOKEN_KEY, accessToken);
      store.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (e) {
      console.error("Failed to save tokens:", e);
    }
  },

  getAccessToken(): string | null {
    try {
      const store = getStore();
      return store.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    try {
      const store = getStore();
      return store.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  clearTokens(): void {
    try {
      const store = getStore();
      store.removeItem(ACCESS_TOKEN_KEY);
      store.removeItem(REFRESH_TOKEN_KEY);
      store.removeItem(USER_KEY);
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
  },

  saveUser(user: any): void {
    try {
      const store = getStore();
      store.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save user:", e);
    }
  },

  getUser(): any | null {
    try {
      const store = getStore();
      const data = store.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};
