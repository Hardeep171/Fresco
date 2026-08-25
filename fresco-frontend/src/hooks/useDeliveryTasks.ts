import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchPartnerTasks,
  setSelectedTask,
  setTaskStatusFilter,
  clearTaskErrors,
  clearSelectedTask,
} from "../store/slices/deliveryTaskSlice";
import { DeliveryTask } from "../types/delivery-task.types";
import { TaskFilterTab } from "../constants/delivery-task.constants";

/**
 * Custom hook providing access to Delivery Task state and operations.
 */
export function useDeliveryTasks() {
  const dispatch = useAppDispatch();
  const {
    tasks,
    selectedTask,
    isFetchingTasks,
    error,
    selectedStatusFilter,
  } = useAppSelector((state) => state.deliveryTask);

  const loadTasks = useCallback(async () => {
    return await dispatch(fetchPartnerTasks());
  }, [dispatch]);

  const selectTask = useCallback(
    (task: DeliveryTask | null) => {
      dispatch(setSelectedTask(task));
    },
    [dispatch]
  );

  const setStatusFilter = useCallback(
    (filter: TaskFilterTab) => {
      dispatch(setTaskStatusFilter(filter));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearTaskErrors());
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch(clearSelectedTask());
  }, [dispatch]);

  return {
    tasks,
    selectedTask,
    isFetchingTasks,
    error,
    selectedStatusFilter,
    loadTasks,
    selectTask,
    setStatusFilter,
    clearErrors,
    clearSelection,
  };
}
