import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from "../../types/address.types";
import { addressApi } from "../../api/address.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import { logoutUser, logoutSuccess } from "./authSlice";

export interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  isLoading: boolean;
  isFetchingById: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  deletingAddressId: string | null;
  isSettingDefault: boolean;
  settingDefaultAddressId: string | null;
  error: NormalizedApiError | null;
  actionError: NormalizedApiError | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  isLoading: false,
  isFetchingById: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  deletingAddressId: null,
  isSettingDefault: false,
  settingDefaultAddressId: null,
  error: null,
  actionError: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

/**
 * Async thunk to fetch all saved addresses for the authenticated user.
 */
export const fetchAddresses = createAsyncThunk<
  Address[],
  void,
  { rejectValue: NormalizedApiError }
>("address/fetchAddresses", async (_, { rejectWithValue }) => {
  try {
    const addresses = await addressApi.getAddresses();
    return addresses;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to fetch a single address by ID.
 */
export const fetchAddressById = createAsyncThunk<
  Address,
  string,
  { rejectValue: NormalizedApiError }
>("address/fetchAddressById", async (id, { rejectWithValue }) => {
  try {
    const address = await addressApi.getAddressById(id);
    return address;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to create a new address.
 */
export const createAddress = createAsyncThunk<
  Address,
  CreateAddressInput,
  { rejectValue: NormalizedApiError }
>("address/createAddress", async (input, { rejectWithValue }) => {
  try {
    const address = await addressApi.createAddress(input);
    return address;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to update an existing address.
 */
export const updateAddress = createAsyncThunk<
  Address,
  { id: string; input: UpdateAddressInput },
  { rejectValue: NormalizedApiError }
>("address/updateAddress", async ({ id, input }, { rejectWithValue }) => {
  try {
    const address = await addressApi.updateAddress(id, input);
    return address;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to delete an address by ID.
 */
export const deleteAddress = createAsyncThunk<
  { id: string; message: string },
  string,
  { rejectValue: NormalizedApiError }
>("address/deleteAddress", async (id, { rejectWithValue }) => {
  try {
    const result = await addressApi.deleteAddress(id);
    return { id, message: result.message };
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to set an address as the default address.
 */
export const setDefaultAddress = createAsyncThunk<
  Address,
  string,
  { rejectValue: NormalizedApiError }
>("address/setDefaultAddress", async (id, { rejectWithValue }) => {
  try {
    const address = await addressApi.setDefaultAddress(id);
    return address;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearAddressErrors: (state) => {
      state.error = null;
      state.actionError = null;
    },
    clearAddressSuccess: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    // FETCH ADDRESSES
    builder.addCase(fetchAddresses.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAddresses.fulfilled, (state, action) => {
      state.addresses = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchAddresses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // FETCH ADDRESS BY ID
    builder.addCase(fetchAddressById.pending, (state) => {
      state.isFetchingById = true;
      state.actionError = null;
    });
    builder.addCase(fetchAddressById.fulfilled, (state, action) => {
      state.selectedAddress = action.payload;
      state.isFetchingById = false;
      state.actionError = null;
      // Also update in list if exists
      const idx = state.addresses.findIndex((a) => a._id === action.payload._id);
      if (idx !== -1) {
        state.addresses[idx] = action.payload;
      }
    });
    builder.addCase(fetchAddressById.rejected, (state, action) => {
      state.isFetchingById = false;
      state.actionError = action.payload || null;
    });

    // CREATE ADDRESS
    builder.addCase(createAddress.pending, (state) => {
      state.isCreating = true;
      state.actionError = null;
      state.createSuccess = false;
    });
    builder.addCase(createAddress.fulfilled, (state, action) => {
      const createdAddress = action.payload;
      state.isCreating = false;
      state.createSuccess = true;
      state.actionError = null;

      // If newly created address is default, unset isDefault for other addresses
      if (createdAddress.isDefault) {
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
      }

      state.addresses.push(createdAddress);
      state.selectedAddress = createdAddress;
    });
    builder.addCase(createAddress.rejected, (state, action) => {
      state.isCreating = false;
      state.actionError = action.payload || null;
      state.createSuccess = false;
    });

    // UPDATE ADDRESS
    builder.addCase(updateAddress.pending, (state) => {
      state.isUpdating = true;
      state.actionError = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateAddress.fulfilled, (state, action) => {
      const updatedAddress = action.payload;
      state.isUpdating = false;
      state.updateSuccess = true;
      state.actionError = null;

      // If updated address is default, unset default on other addresses
      if (updatedAddress.isDefault) {
        state.addresses = state.addresses.map((addr) =>
          addr._id === updatedAddress._id
            ? updatedAddress
            : { ...addr, isDefault: false }
        );
      } else {
        state.addresses = state.addresses.map((addr) =>
          addr._id === updatedAddress._id ? updatedAddress : addr
        );
      }

      state.selectedAddress = updatedAddress;
    });
    builder.addCase(updateAddress.rejected, (state, action) => {
      state.isUpdating = false;
      state.actionError = action.payload || null;
      state.updateSuccess = false;
    });

    // DELETE ADDRESS
    builder.addCase(deleteAddress.pending, (state, action) => {
      state.isDeleting = true;
      state.deletingAddressId = action.meta.arg;
      state.actionError = null;
      state.deleteSuccess = false;
    });
    builder.addCase(deleteAddress.fulfilled, (state, action) => {
      const deletedId = action.payload.id;
      const wasDefault = state.addresses.find((a) => a._id === deletedId)?.isDefault;

      state.addresses = state.addresses.filter((addr) => addr._id !== deletedId);
      if (state.selectedAddress?._id === deletedId) {
        state.selectedAddress = null;
      }

      // If deleted address was default and addresses remain, backend assigns the next default address
      if (wasDefault && state.addresses.length > 0 && state.addresses[0]) {
        const hasDefault = state.addresses.some((a) => a.isDefault);
        if (!hasDefault) {
          state.addresses[0].isDefault = true;
        }
      }

      state.isDeleting = false;
      state.deletingAddressId = null;
      state.deleteSuccess = true;
      state.actionError = null;
    });
    builder.addCase(deleteAddress.rejected, (state, action) => {
      state.isDeleting = false;
      state.deletingAddressId = null;
      state.actionError = action.payload || null;
      state.deleteSuccess = false;
    });

    // SET DEFAULT ADDRESS
    builder.addCase(setDefaultAddress.pending, (state, action) => {
      state.isSettingDefault = true;
      state.settingDefaultAddressId = action.meta.arg;
      state.actionError = null;
    });
    builder.addCase(setDefaultAddress.fulfilled, (state, action) => {
      const defaultId = action.payload._id;
      state.addresses = state.addresses.map((addr) => ({
        ...addr,
        isDefault: addr._id === defaultId,
      }));
      state.isSettingDefault = false;
      state.settingDefaultAddressId = null;
      state.actionError = null;
    });
    builder.addCase(setDefaultAddress.rejected, (state, action) => {
      state.isSettingDefault = false;
      state.settingDefaultAddressId = null;
      state.actionError = action.payload || null;
    });

    // LOGOUT RESET
    builder.addCase(logoutUser.fulfilled, () => initialState);
    builder.addCase(logoutSuccess, () => initialState);
  },
});

export const {
  clearAddressErrors,
  clearAddressSuccess,
  setSelectedAddress,
} = addressSlice.actions;

export default addressSlice.reducer;
