import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Category, GetCategoriesParams } from "../../types/catalog.types";
import { categoryApi } from "../../api/category.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";

export interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: NormalizedApiError | null;
}

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

/**
 * Async thunk to fetch all categories from backend.
 */
export const fetchCategories = createAsyncThunk<
  Category[],
  GetCategoriesParams | undefined,
  { rejectValue: NormalizedApiError }
>("category/fetchCategories", async (params, { rejectWithValue }) => {
  try {
    const categories = await categoryApi.getCategories(params || {});
    return categories;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to fetch single category by ID.
 */
export const fetchCategoryById = createAsyncThunk<
  Category,
  string,
  { rejectValue: NormalizedApiError }
>("category/fetchCategoryById", async (id, { rejectWithValue }) => {
  try {
    const category = await categoryApi.getCategoryById(id);
    return category;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    clearCategoryErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH CATEGORIES
    builder.addCase(fetchCategories.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // FETCH CATEGORY BY ID
    builder.addCase(fetchCategoryById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCategoryById.fulfilled, (state, action) => {
      state.selectedCategory = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchCategoryById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });
  },
});

export const { setSelectedCategory, clearCategoryErrors } =
  categorySlice.actions;

export default categorySlice.reducer;
