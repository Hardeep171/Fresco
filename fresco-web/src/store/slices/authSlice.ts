import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthTokens, LoginInput, RegisterInput } from "../../types/auth.types";
import { authApi } from "../../api/auth.api";
import { userApi } from "../../api/user.api";
import { storageService } from "../../services/storage.service";
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

// Synchronously pre-hydrate initial state from persistent storage
const initialAccessToken = storageService.getAccessToken();
const initialRefreshToken = storageService.getRefreshToken();
const initialUser = storageService.getUser();
const hasTokens = Boolean(initialAccessToken && initialRefreshToken);

const initialState: AuthState = {
  user: initialUser,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: Boolean(hasTokens && initialUser),
  isRestoringToken: hasTokens,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  LoginInput,
  { rejectValue: NormalizedApiError }
>("auth/loginUser", async (input, { rejectWithValue }) => {
  try {
    const data = await authApi.login(input);
    storageService.saveTokens(data.accessToken, data.refreshToken);
    storageService.saveUser(data.user);
    return data;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const registerUser = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  RegisterInput,
  { rejectValue: NormalizedApiError }
>("auth/registerUser", async (input, { rejectWithValue }) => {
  try {
    const data = await authApi.register(input);
    storageService.saveTokens(data.accessToken, data.refreshToken);
    storageService.saveUser(data.user);
    return data;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const restoreUserSession = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string } | null,
  void,
  { rejectValue: NormalizedApiError }
>("auth/restoreUserSession", async (_, { rejectWithValue }) => {
  try {
    const accessToken = storageService.getAccessToken();
    const refreshToken = storageService.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    const user = await userApi.getProfile();
    storageService.saveUser(user);
    return { user, accessToken, refreshToken };
  } catch (error: unknown) {
    storageService.clearTokens();
    return rejectWithValue(normalizeApiError(error));
  }
});

export const logoutUser = createAsyncThunk<void, void>(
  "auth/logoutUser",
  async () => {
    try {
      const refreshToken = storageService.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore server error on logout
    } finally {
      storageService.clearTokens();
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
    clearAuthFieldError: (state, action: PayloadAction<string>) => {
      if (state.error?.fieldErrors) {
        delete state.error.fieldErrors[action.payload];
        if (Object.keys(state.error.fieldErrors).length === 0) {
          state.error = null;
        }
      }
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
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
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
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

    builder.addCase(logoutUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isRestoringToken = false;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(logoutUser.rejected, (state) => {
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

export const { clearAuthError, clearAuthFieldError, setTokens, setUser, logoutSuccess } =
  authSlice.actions;

export default authSlice.reducer;
