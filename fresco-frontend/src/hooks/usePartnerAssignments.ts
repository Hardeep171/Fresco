import { useCallback } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  fetchPartnerAssignments,
  acceptPartnerAssignment,
  completePartnerAssignment,
  fetchAssignmentOrderDetails,
  setSelectedAssignment,
  setAssignmentStatusFilter,
  clearAssignmentErrors,
  clearSelectedAssignment,
} from "../store/slices/partnerAssignmentSlice";
import { Assignment } from "../types/assignment.types";
import { AssignmentFilterTab } from "../constants/assignment.constants";

/**
 * Custom hook providing access to Delivery Partner Assignment state and operations.
 */
export function usePartnerAssignments() {
  const dispatch = useAppDispatch();
  const {
    assignments,
    selectedAssignment,
    selectedAssignmentOrder,
    isFetchingAssignments,
    isAcceptingAssignment,
    isCompletingAssignment,
    isFetchingOrderDetails,
    error,
    acceptError,
    completeError,
    selectedStatusFilter,
  } = useAppSelector((state) => state.partnerAssignment);

  const loadAssignments = useCallback(async () => {
    return await dispatch(fetchPartnerAssignments());
  }, [dispatch]);

  const acceptAssignment = useCallback(
    async (assignmentId: string) => {
      const result = await dispatch(acceptPartnerAssignment(assignmentId));
      return acceptPartnerAssignment.fulfilled.match(result);
    },
    [dispatch]
  );

  const completeAssignment = useCallback(
    async (assignmentId: string) => {
      const result = await dispatch(completePartnerAssignment(assignmentId));
      return completePartnerAssignment.fulfilled.match(result);
    },
    [dispatch]
  );

  const loadOrderDetails = useCallback(
    async (orderId: string) => {
      return await dispatch(fetchAssignmentOrderDetails(orderId));
    },
    [dispatch]
  );

  const selectAssignment = useCallback(
    (assignment: Assignment | null) => {
      dispatch(setSelectedAssignment(assignment));
    },
    [dispatch]
  );

  const setStatusFilter = useCallback(
    (filter: AssignmentFilterTab) => {
      dispatch(setAssignmentStatusFilter(filter));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearAssignmentErrors());
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch(clearSelectedAssignment());
  }, [dispatch]);

  return {
    assignments,
    selectedAssignment,
    selectedAssignmentOrder,
    isFetchingAssignments,
    isAcceptingAssignment,
    isCompletingAssignment,
    isFetchingOrderDetails,
    error,
    acceptError,
    completeError,
    selectedStatusFilter,
    loadAssignments,
    acceptAssignment,
    completeAssignment,
    loadOrderDetails,
    selectAssignment,
    setStatusFilter,
    clearErrors,
    clearSelection,
  };
}
