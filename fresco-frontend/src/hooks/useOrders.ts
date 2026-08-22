import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  createOrder,
  fetchUserOrders,
  fetchOrderById,
  cancelUserOrder,
  clearOrderErrors,
  clearCreatedOrder,
  setCurrentOrder,
  setSelectedStatusFilter,
  clearCancelState,
  clearDetailsError,
} from "../store/slices/orderSlice";
import { CreateOrderInput, Order, OrderFilters } from "../types/order.types";
import { OrderFilterTab } from "../constants/order.constants";

/**
 * Custom hook providing access to Order state and actions.
 */
export function useOrders() {
  const dispatch = useAppDispatch();
  const {
    orders,
    currentOrder,
    createdOrder,
    isLoading,
    isFetchingOrders,
    isFetchingDetails,
    isCancellingOrder,
    isPlacingOrder,
    error,
    ordersError,
    detailsError,
    cancelError,
    placeOrderError,
    cancelSuccess,
    placeOrderSuccess,
    selectedStatusFilter,
  } = useAppSelector((state) => state.order);


  const placeOrder = useCallback(
    async (input: CreateOrderInput) => {
      const result = await dispatch(createOrder(input));
      if (createOrder.fulfilled.match(result)) {
        return result.payload;
      }
      return null;
    },
    [dispatch]
  );

  const loadUserOrders = useCallback(
    async (filters?: OrderFilters) => {
      const result = await dispatch(fetchUserOrders(filters));
      return fetchUserOrders.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadOrderById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchOrderById(id));
      return fetchOrderById.fulfilled.match(result);
    },
    [dispatch]
  );

  const cancelOrder = useCallback(
    async (id: string) => {
      const result = await dispatch(cancelUserOrder(id));
      return cancelUserOrder.fulfilled.match(result);
    },
    [dispatch]
  );

  const selectOrder = useCallback(
    (order: Order | null) => {
      dispatch(setCurrentOrder(order));
    },
    [dispatch]
  );

  const setStatusFilter = useCallback(
    (filter: OrderFilterTab) => {
      dispatch(setSelectedStatusFilter(filter));
    },
    [dispatch]
  );

  const clearCancel = useCallback(() => {
    dispatch(clearCancelState());
  }, [dispatch]);

  const clearDetailsErr = useCallback(() => {
    dispatch(clearDetailsError());
  }, [dispatch]);

  const clearCreated = useCallback(() => {
    dispatch(clearCreatedOrder());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearOrderErrors());
  }, [dispatch]);

  return {
    orders,
    currentOrder,
    createdOrder,
    isLoading,
    isFetchingOrders,
    isFetchingDetails,
    isCancellingOrder,
    isPlacingOrder,
    error,
    ordersError,
    detailsError,
    cancelError,
    placeOrderError,
    cancelSuccess,
    placeOrderSuccess,
    selectedStatusFilter,

    placeOrder,
    loadUserOrders,
    loadOrderById,
    cancelOrder,
    selectOrder,
    setStatusFilter,
    clearCancel,
    clearDetailsErr,
    clearCreated,
    clearErrors,
  };
}

