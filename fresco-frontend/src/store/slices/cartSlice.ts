import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Cart, AddCartItemInput } from "../../types/cart.types";
import { cartApi } from "../../api/cart.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";
import { logoutUser, logoutSuccess } from "./authSlice";

export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isAddingItem: boolean;
  isMutating: boolean;
  mutatingItemId: string | null;
  error: NormalizedApiError | null;
  mutationError: NormalizedApiError | null;
  addSuccess: boolean;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  isAddingItem: false,
  isMutating: false,
  mutatingItemId: null,
  error: null,
  mutationError: null,
  addSuccess: false,
};

/**
 * Async thunk to fetch customer's active cart.
 */
export const fetchCart = createAsyncThunk<
  Cart,
  void,
  { rejectValue: NormalizedApiError }
>("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const cart = await cartApi.getCart();
    return cart;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to add an item to the cart.
 */
export const addCartItem = createAsyncThunk<
  Cart,
  AddCartItemInput,
  { rejectValue: NormalizedApiError }
>("cart/addCartItem", async (input, { rejectWithValue }) => {
  try {
    const cart = await cartApi.addItem(input);
    return cart;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to update quantity of a specific cart item.
 */
export const updateCartItemQuantity = createAsyncThunk<
  Cart,
  { cartItemId: string; quantity: number },
  { rejectValue: NormalizedApiError }
>("cart/updateCartItemQuantity", async ({ cartItemId, quantity }, { rejectWithValue }) => {
  try {
    const cart = await cartApi.updateItemQuantity(cartItemId, quantity);
    return cart;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to remove a specific item from the cart.
 */
export const removeCartItem = createAsyncThunk<
  Cart,
  string,
  { rejectValue: NormalizedApiError }
>("cart/removeCartItem", async (cartItemId, { rejectWithValue }) => {
  try {
    const cart = await cartApi.removeItem(cartItemId);
    return cart;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to clear the entire cart.
 */
export const clearEntireCart = createAsyncThunk<
  Cart,
  void,
  { rejectValue: NormalizedApiError }
>("cart/clearEntireCart", async (_, { rejectWithValue }) => {
  try {
    const cart = await cartApi.clearCart();
    return cart;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Cart | null>) => {
      state.cart = action.payload;
    },
    clearCartErrors: (state) => {
      state.error = null;
      state.mutationError = null;
    },
    clearAddSuccess: (state) => {
      state.addSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // FETCH CART
    builder.addCase(fetchCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // ADD ITEM
    builder.addCase(addCartItem.pending, (state) => {
      state.isAddingItem = true;
      state.mutationError = null;
      state.addSuccess = false;
    });
    builder.addCase(addCartItem.fulfilled, (state, action) => {
      state.cart = action.payload;
      state.isAddingItem = false;
      state.addSuccess = true;
      state.mutationError = null;
    });
    builder.addCase(addCartItem.rejected, (state, action) => {
      state.isAddingItem = false;
      state.addSuccess = false;
      state.mutationError = action.payload || null;
    });

    // UPDATE ITEM QUANTITY
    builder.addCase(updateCartItemQuantity.pending, (state, action) => {
      state.isMutating = true;
      state.mutatingItemId = action.meta.arg.cartItemId;
      state.mutationError = null;
    });
    builder.addCase(updateCartItemQuantity.fulfilled, (state, action) => {
      state.cart = action.payload;
      state.isMutating = false;
      state.mutatingItemId = null;
      state.mutationError = null;
    });
    builder.addCase(updateCartItemQuantity.rejected, (state, action) => {
      state.isMutating = false;
      state.mutatingItemId = null;
      state.mutationError = action.payload || null;
    });

    // REMOVE ITEM
    builder.addCase(removeCartItem.pending, (state, action) => {
      state.isMutating = true;
      state.mutatingItemId = action.meta.arg;
      state.mutationError = null;
    });
    builder.addCase(removeCartItem.fulfilled, (state, action) => {
      state.cart = action.payload;
      state.isMutating = false;
      state.mutatingItemId = null;
      state.mutationError = null;
    });
    builder.addCase(removeCartItem.rejected, (state, action) => {
      state.isMutating = false;
      state.mutatingItemId = null;
      state.mutationError = action.payload || null;
    });

    // CLEAR CART
    builder.addCase(clearEntireCart.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
    });
    builder.addCase(clearEntireCart.fulfilled, (state, action) => {
      state.cart = action.payload;
      state.isMutating = false;
      state.mutationError = null;
    });
    builder.addCase(clearEntireCart.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
    });

    // LOGOUT RESET
    builder.addCase(logoutUser.fulfilled, () => initialState);
    builder.addCase(logoutSuccess, () => initialState);
  },
});

export const { setCart, clearCartErrors, clearAddSuccess } =
  cartSlice.actions;

export default cartSlice.reducer;
