import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchCategories,
  fetchCategoryById,
  setSelectedCategory,
  clearCategoryErrors,
} from "../store/slices/categorySlice";
import { Category, GetCategoriesParams } from "../types/catalog.types";

/**
 * Custom hook providing access to Category state and actions.
 */
export function useCategories() {
  const dispatch = useAppDispatch();
  const { categories, selectedCategory, isLoading, error } = useAppSelector(
    (state) => state.category
  );

  const loadCategories = useCallback(
    async (params?: GetCategoriesParams) => {
      const result = await dispatch(fetchCategories(params));
      return fetchCategories.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadCategoryById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchCategoryById(id));
      return fetchCategoryById.fulfilled.match(result);
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

  return {
    categories,
    selectedCategory,
    isLoading,
    error,
    loadCategories,
    loadCategoryById,
    selectCategory,
    clearErrors,
  };
}
