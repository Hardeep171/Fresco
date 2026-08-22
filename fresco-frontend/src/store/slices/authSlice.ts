import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthTokens, LoginInput, RegisterInput } from "../../types/auth.types";
import { authApi } from "../../api/auth.api";
import { userApi } from "../../api/user.api";
import { secureStorage } from "../../services/secureStorage.service";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isRestoringToken: boolean;
  isLoading: boolean;
  error: NormalizedApiError | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isRestoringToken: true,
  isLoading: false,
  error: null,
};

/**
 * Async thunk to authenticate user credentials.
 */
export const loginUser = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  LoginInput,
  { rejectValue: NormalizedApiError }
>("auth/loginUser", async (input, { rejectWithValue }) => {
  try {
    const data = await authApi.login(input);
    await secureStorage.saveTokens(data.accessToken, data.refreshToken);
    return data;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to register a new customer account.
 */
export const registerUser = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  RegisterInput,
  { rejectValue: NormalizedApiError }
>("auth/registerUser", async (input, { rejectWithValue }) => {
  try {
    const data = await authApi.register(input);
    await secureStorage.saveTokens(data.accessToken, data.refreshToken);
    return data;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to restore user session on app startup from SecureStore.
 */
export const restoreUserSession = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string } | null,
  void,
  { rejectValue: NormalizedApiError }
>("auth/restoreUserSession", async (_, { rejectWithValue }) => {
  try {
    const accessToken = await secureStorage.getAccessToken();
    const refreshToken = await secureStorage.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    // Verify session by fetching user profile
    const user = await userApi.getProfile();
    return { user, accessToken, refreshToken };
  } catch (error: unknown) {
    await secureStorage.clearTokens();
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to log out user, revoke refresh token on backend, and wipe SecureStore.
 */
export const logoutUser = createAsyncThunk<void, void>(
  "auth/logoutUser",
  async () => {
    try {
      const refreshToken = await secureStorage.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Proceed with local logout even if server is unreachable
    } finally {
      await secureStorage.clearTokens();
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isRestoringToken = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
      state.isAuthenticated = false;
    });

    // REGISTER
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
      state.isAuthenticated = false;
    });

    // RESTORE SESSION
    builder.addCase(restoreUserSession.pending, (state) => {
      state.isRestoringToken = true;
    });
    builder.addCase(restoreUserSession.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
      state.isRestoringToken = false;
    });
    builder.addCase(restoreUserSession.rejected, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isRestoringToken = false;
    });

    // LOGOUT
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isRestoringToken = false;
      state.isLoading = false;
      state.error = null;
    });
  },
});

export const { clearAuthError, setTokens, setUser, logoutSuccess } =
  authSlice.actions;

export default authSlice.reducer;
