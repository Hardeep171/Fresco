import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Category,
  GetCategoriesParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../types/catalog.types";
import { categoryApi } from "../../api/category.api";
import { normalizeApiError } from "../../api/error";
import { NormalizedApiError } from "../../types/api.types";

export interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  isMutating: boolean;
  error: NormalizedApiError | null;
  mutationError: NormalizedApiError | null;
  mutationSuccess: boolean;
}

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  isMutating: false,
  error: null,
  mutationError: null,
  mutationSuccess: false,
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
 * Async thunk to fetch all categories for admin (both active and inactive).
 */
export const fetchAllCategoriesAdmin = createAsyncThunk<
  Category[],
  void,
  { rejectValue: NormalizedApiError }
>("category/fetchAllCategoriesAdmin", async (_, { rejectWithValue }) => {
  try {
    return await categoryApi.getAllCategoriesForAdmin();
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

/**
 * Async thunk to create a new category (Admin operation).
 */
export const createCategoryThunk = createAsyncThunk<
  Category,
  CreateCategoryInput,
  { rejectValue: NormalizedApiError }
>("category/createCategory", async (data, { rejectWithValue }) => {
  try {
    return await categoryApi.createCategory(data);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to update an existing category (Admin operation).
 */
export const updateCategoryThunk = createAsyncThunk<
  Category,
  { id: string; data: UpdateCategoryInput },
  { rejectValue: NormalizedApiError }
>("category/updateCategory", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await categoryApi.updateCategory(id, data);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to enable a category (Admin operation).
 */
export const enableCategoryThunk = createAsyncThunk<
  Category,
  string,
  { rejectValue: NormalizedApiError }
>("category/enableCategory", async (id, { rejectWithValue }) => {
  try {
    return await categoryApi.enableCategory(id);
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/**
 * Async thunk to disable a category (soft-delete, Admin operation).
 */
export const disableCategoryThunk = createAsyncThunk<
  Category,
  string,
  { rejectValue: NormalizedApiError }
>("category/disableCategory", async (id, { rejectWithValue }) => {
  try {
    return await categoryApi.disableCategory(id);
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
    clearCategoryMutationState: (state) => {
      state.mutationError = null;
      state.mutationSuccess = false;
      state.isMutating = false;
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

    // FETCH ALL CATEGORIES ADMIN
    builder.addCase(fetchAllCategoriesAdmin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllCategoriesAdmin.fulfilled, (state, action) => {
      state.categories = action.payload;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchAllCategoriesAdmin.rejected, (state, action) => {
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

    // CREATE CATEGORY
    builder.addCase(createCategoryThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(createCategoryThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.categories.findIndex((c) => c._id === action.payload._id);
      if (index >= 0) {
        state.categories[index] = action.payload;
      } else {
        state.categories.push(action.payload);
      }
      state.categories.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    });
    builder.addCase(createCategoryThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    // UPDATE CATEGORY
    builder.addCase(updateCategoryThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(updateCategoryThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.categories.findIndex((c) => c._id === action.payload._id);
      if (index >= 0) {
        state.categories[index] = action.payload;
      } else {
        state.categories.push(action.payload);
      }
      state.categories.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      if (state.selectedCategory?._id === action.payload._id) {
        state.selectedCategory = action.payload;
      }
    });
    builder.addCase(updateCategoryThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    // ENABLE CATEGORY
    builder.addCase(enableCategoryThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(enableCategoryThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.categories.findIndex((c) => c._id === action.payload._id);
      if (index >= 0) {
        state.categories[index] = action.payload;
      }
    });
    builder.addCase(enableCategoryThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });

    // DISABLE CATEGORY
    builder.addCase(disableCategoryThunk.pending, (state) => {
      state.isMutating = true;
      state.mutationError = null;
      state.mutationSuccess = false;
    });
    builder.addCase(disableCategoryThunk.fulfilled, (state, action) => {
      state.isMutating = false;
      state.mutationSuccess = true;
      state.mutationError = null;
      const index = state.categories.findIndex((c) => c._id === action.payload._id);
      if (index >= 0) {
        state.categories[index] = action.payload;
      }
    });
    builder.addCase(disableCategoryThunk.rejected, (state, action) => {
      state.isMutating = false;
      state.mutationError = action.payload || null;
      state.mutationSuccess = false;
    });
  },
});

export const {
  setSelectedCategory,
  clearCategoryErrors,
  clearCategoryMutationState,
} = categorySlice.actions;

export default categorySlice.reducer;

