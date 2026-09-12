import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchCategories,
  fetchAllCategoriesAdmin,
  fetchCategoryById,
  createCategoryThunk,
  updateCategoryThunk,
  enableCategoryThunk,
  disableCategoryThunk,
  setSelectedCategory,
  clearCategoryErrors,
  clearCategoryMutationState,
} from "../store/slices/categorySlice";
import {
  Category,
  GetCategoriesParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/catalog.types";

export function useCategories() {
  const dispatch = useAppDispatch();
  const {
    categories,
    selectedCategory,
    isLoading,
    isMutating,
    error,
    mutationError,
    mutationSuccess,
  } = useAppSelector((state) => state.category);

  const loadCategories = useCallback(
    async (params?: GetCategoriesParams) => {
      const result = await dispatch(fetchCategories(params));
      return fetchCategories.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadAllCategoriesAdmin = useCallback(async () => {
    const result = await dispatch(fetchAllCategoriesAdmin());
    return fetchAllCategoriesAdmin.fulfilled.match(result);
  }, [dispatch]);

  const loadCategoryById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchCategoryById(id));
      return fetchCategoryById.fulfilled.match(result);
    },
    [dispatch]
  );

  const createCategory = useCallback(
    async (data: CreateCategoryInput) => {
      const result = await dispatch(createCategoryThunk(data));
      return createCategoryThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const updateCategory = useCallback(
    async (id: string, data: UpdateCategoryInput) => {
      const result = await dispatch(updateCategoryThunk({ id, data }));
      return updateCategoryThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const enableCategory = useCallback(
    async (id: string) => {
      const result = await dispatch(enableCategoryThunk(id));
      return enableCategoryThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const disableCategory = useCallback(
    async (id: string) => {
      const result = await dispatch(disableCategoryThunk(id));
      return disableCategoryThunk.fulfilled.match(result);
    },
    [dispatch]
  );

  const selectCategory = useCallback(
    (category: Category | null) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearCategoryErrors());
  }, [dispatch]);

  const clearMutation = useCallback(() => {
    dispatch(clearCategoryMutationState());
  }, [dispatch]);

  return {
    categories,
    selectedCategory,
    isLoading,
    isMutating,
    error,
    mutationError,
    mutationSuccess,
    loadCategories,
    loadAllCategoriesAdmin,
    loadCategoryById,
    createCategory,
    updateCategory,
    enableCategory,
    disableCategory,
    selectCategory,
    clearErrors,
    clearMutation,
  };
}
