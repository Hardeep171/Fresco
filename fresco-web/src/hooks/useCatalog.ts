import { useCallback } from "react";
import { useCategories } from "./useCategories";
import { useGarments } from "./useGarments";
import { useServices } from "./useServices";
import { usePricing } from "./usePricing";
import { ServiceOptionWithPrice } from "../types/catalog.types";

export function useCatalog() {
  const {
    categories,
    selectedCategory,
    isLoading: isCategoriesLoading,
    error: categoryError,
    loadCategories,
    loadCategoryById,
    selectCategory,
  } = useCategories();

  const {
    garments,
    selectedGarment,
    isLoading: isGarmentsLoading,
    error: garmentError,
    loadGarments,
    loadGarmentById,
    selectGarment,
  } = useGarments();

  const {
    services,
    selectedService,
    isLoading: isServicesLoading,
    error: serviceError,
    loadServices,
    loadServiceById,
    selectService,
  } = useServices();

  const {
    pricingList,
    isLoading: isPricingLoading,
    error: pricingError,
    loadPricing,
    resetPricing,
  } = usePricing();

  const loadInitialCatalog = useCallback(async () => {
    return Promise.all([
      loadCategories({ isActive: true }),
      loadServices({ isActive: true }),
      loadPricing({ isActive: true }),
    ]);
  }, [loadCategories, loadServices, loadPricing]);

  const getServicesForGarment = useCallback(
    (garmentId: string): ServiceOptionWithPrice[] => {
      const garmentPricing = pricingList.filter(
        (p) => p.garmentId === garmentId && p.isActive
      );

      const result: ServiceOptionWithPrice[] = [];

      for (const price of garmentPricing) {
        const matchedService = services.find(
          (s) => s._id === price.serviceId && s.isActive
        );
        if (matchedService) {
          result.push({
            service: matchedService,
            pricing: price,
          });
        }
      }

      return result.sort(
        (a, b) => (a.service.displayOrder || 0) - (b.service.displayOrder || 0)
      );
    },
    [pricingList, services]
  );

  return {
    categories,
    selectedCategory,
    garments,
    selectedGarment,
    services,
    selectedService,
    pricingList,
    isLoading:
      isCategoriesLoading ||
      isGarmentsLoading ||
      isServicesLoading ||
      isPricingLoading,
    isCategoriesLoading,
    isGarmentsLoading,
    isServicesLoading,
    isPricingLoading,
    error: categoryError || garmentError || serviceError || pricingError,
    loadCategories,
    loadCategoryById,
    selectCategory,
    loadGarments,
    loadGarmentById,
    selectGarment,
    loadServices,
    loadServiceById,
    selectService,
    loadPricing,
    resetPricing,
    loadInitialCatalog,
    getServicesForGarment,
  };
}
