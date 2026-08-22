import { useCallback, useMemo } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchCart,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearEntireCart,
  clearCartErrors,
  clearAddSuccess,
} from "../store/slices/cartSlice";
import { AddCartItemInput, EnrichedCartItem } from "../types/cart.types";

/**
 * Custom hook providing typed access to Cart state and asynchronous actions.
 */
export function useCart() {
  const dispatch = useAppDispatch();
  const {
    cart,
    isLoading,
    isAddingItem,
    isMutating,
    mutatingItemId,
    error,
    mutationError,
    addSuccess,
  } = useAppSelector((state) => state.cart);

  const { garments } = useAppSelector((state) => state.garment);
  const { services } = useAppSelector((state) => state.service);

  const items = useMemo(() => cart?.items || [], [cart]);
  const totalAmount = useMemo(() => cart?.totalAmount || 0, [cart]);

  // Total quantity of all items in cart (for badges and headers)
  const totalItemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [items]);

  // Enriched items with resolved garment & service display names
  const enrichedItems = useMemo((): EnrichedCartItem[] => {
    return items.map((item) => {
      const garment = garments.find((g) => g._id === item.garmentId);
      const service = services.find((s) => s._id === item.serviceId);

      return {
        ...item,
        garmentName: garment?.name
          ? garment.name.charAt(0).toUpperCase() + garment.name.slice(1)
          : "Garment",
        serviceName: service?.name
          ? service.name.charAt(0).toUpperCase() + service.name.slice(1)
          : "Fabric Care Service",
      };
    });
  }, [items, garments, services]);

  const loadCart = useCallback(async () => {
    const result = await dispatch(fetchCart());
    return fetchCart.fulfilled.match(result);
  }, [dispatch]);

  const addItem = useCallback(
    async (input: AddCartItemInput) => {
      const result = await dispatch(addCartItem(input));
      return addCartItem.fulfilled.match(result);
    },
    [dispatch]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      const result = await dispatch(
        updateCartItemQuantity({ cartItemId, quantity })
      );
      return updateCartItemQuantity.fulfilled.match(result);
    },
    [dispatch]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      const result = await dispatch(removeCartItem(cartItemId));
      return removeCartItem.fulfilled.match(result);
    },
    [dispatch]
  );

  const clearCart = useCallback(async () => {
    const result = await dispatch(clearEntireCart());
    return clearEntireCart.fulfilled.match(result);
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearCartErrors());
  }, [dispatch]);

  const clearSuccess = useCallback(() => {
    dispatch(clearAddSuccess());
  }, [dispatch]);

  return {
    cart,
    items,
    enrichedItems,
    totalAmount,
    totalItemCount,
    isLoading,
    isAddingItem,
    isMutating,
    mutatingItemId,
    error,
    mutationError,
    addSuccess,
    loadCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    clearErrors,
    clearSuccess,
  };
}
