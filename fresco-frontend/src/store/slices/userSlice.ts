import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/auth.types";
import { UpdateProfileInput, ChangePasswordInput } from "../../types/user.types";
import { userApi } from "../../api/user.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import { setUser } from "./authSlice";

export interface UserState {
  profile: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  isChangingPassword: boolean;
  error: NormalizedApiError | null;
  updateError: NormalizedApiError | null;
  changePasswordError: NormalizedApiError | null;
  updateSuccess: boolean;
  changePasswordSuccess: boolean;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  isChangingPassword: false,
  error: null,
  updateError: null,
  changePasswordError: null,
  updateSuccess: false,
  changePasswordSuccess: false,
};

/**
 * Async thunk to fetch current authenticated user profile.
 */
export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: NormalizedApiError }
>("user/fetchUserProfile", async (_, { dispatch, rejectWithValue }) => {
  try {
    const user = await userApi.getProfile();
    // Keep authSlice user synchronized
    dispatch(setUser(user));
    return user;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to update profile details (firstName, lastName, phone).
 */
export const updateUserProfile = createAsyncThunk<
  User,
  UpdateProfileInput,
  { rejectValue: NormalizedApiError }
>("user/updateUserProfile", async (input, { dispatch, rejectWithValue }) => {
  try {
    const updatedUser = await userApi.updateProfile(input);
    // Keep authSlice user synchronized
    dispatch(setUser(updatedUser));
    return updatedUser;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to change account password.
 */
export const changeUserPassword = createAsyncThunk<
  { message: string },
  ChangePasswordInput,
  { rejectValue: NormalizedApiError }
>("user/changeUserPassword", async (input, { rejectWithValue }) => {
  try {
    const result = await userApi.changePassword(input);
    return result;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<User | null>) => {
      state.profile = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
      state.updateError = null;
      state.changePasswordError = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearChangePasswordSuccess: (state) => {
      state.changePasswordSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // FETCH USER PROFILE
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.profile = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // UPDATE USER PROFILE
    builder.addCase(updateUserProfile.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.profile = action.payload;
      state.isUpdating = false;
      state.updateError = null;
      state.updateSuccess = true;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || null;
      state.updateSuccess = false;
    });

    // CHANGE USER PASSWORD
    builder.addCase(changeUserPassword.pending, (state) => {
      state.isChangingPassword = true;
      state.changePasswordError = null;
      state.changePasswordSuccess = false;
    });
    builder.addCase(changeUserPassword.fulfilled, (state) => {
      state.isChangingPassword = false;
      state.changePasswordError = null;
      state.changePasswordSuccess = true;
    });
    builder.addCase(changeUserPassword.rejected, (state, action) => {
      state.isChangingPassword = false;
      state.changePasswordError = action.payload || null;
      state.changePasswordSuccess = false;
    });
  },
});

export const {
  setUserProfile,
  clearUserError,
  clearUpdateSuccess,
  clearChangePasswordSuccess,
} = userSlice.actions;

export default userSlice.reducer;
