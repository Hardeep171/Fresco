import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PartnerStackParamList } from "../../types/navigation.types";
import { Assignment } from "../../types/assignment.types";
import {
  AssignmentFilterTab,
  ASSIGNMENT_STATUS_LABELS,
  AssignmentStatus,
} from "../../constants/assignment.constants";
import { usePartnerAssignments } from "../../hooks/usePartnerAssignments";
import {
  AppHeader,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import {
  AssignmentCard,
  AssignmentFilterChips,
} from "../../components/partner";
import { colors, spacing } from "../../theme";

type Props = NativeStackScreenProps<PartnerStackParamList, "AssignmentListScreen">;

export const AssignmentListScreen: React.FC<Props> = ({ route, navigation }) => {
  const initialFilter = route.params?.initialFilter as AssignmentFilterTab | undefined;

  const {
    assignments,
    isFetchingAssignments,
    isAcceptingAssignment,
    isCompletingAssignment,
    error,
    selectedStatusFilter,
    loadAssignments,
    acceptAssignment,
    completeAssignment,
    setStatusFilter,
  } = usePartnerAssignments();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter);
    }
    loadAssignments();
  }, [initialFilter, setStatusFilter, loadAssignments]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
  }, [loadAssignments]);

  const handleAssignmentPress = useCallback(
    (assignment: Assignment) => {
      navigation.navigate("AssignmentDetailsScreen", {
        assignmentId: assignment._id,
      });
    },
    [navigation]
  );

  const handleAccept = useCallback(
    async (assignment: Assignment) => {
      await acceptAssignment(assignment._id);
      loadAssignments();
    },
    [acceptAssignment, loadAssignments]
  );

  const handleComplete = useCallback(
    async (assignment: Assignment) => {
      await completeAssignment(assignment._id);
      loadAssignments();
    },
    [completeAssignment, loadAssignments]
  );

  // Compute count of assignments per filter tab
  const statusCounts = useMemo(() => {
    const counts: Partial<Record<AssignmentFilterTab, number>> = {
      ALL: assignments.length,
    };
    assignments.forEach((assignment) => {
      const statusKey = assignment.status as AssignmentFilterTab;
      counts[statusKey] = (counts[statusKey] || 0) + 1;
    });
    return counts;
  }, [assignments]);

  // Filter assignments according to selected tab
  const filteredAssignments = useMemo(() => {
    if (selectedStatusFilter === "ALL") {
      return assignments;
    }
    return assignments.filter(
      (assignment) => assignment.status === selectedStatusFilter
    );
  }, [assignments, selectedStatusFilter]);

  const renderItem = useCallback(
    ({ item }: { item: Assignment }) => (
      <AssignmentCard
        assignment={item}
        onPress={handleAssignmentPress}
        onAccept={handleAccept}
        onComplete={handleComplete}
        isActionLoading={isAcceptingAssignment || isCompletingAssignment}
      />
    ),
    [
      handleAssignmentPress,
      handleAccept,
      handleComplete,
      isAcceptingAssignment,
      isCompletingAssignment,
    ]
  );

  const renderEmptyState = useCallback(() => {
    if (selectedStatusFilter !== "ALL") {
      const statusLabel =
        ASSIGNMENT_STATUS_LABELS[selectedStatusFilter as AssignmentStatus] ||
        selectedStatusFilter;
      return (
        <EmptyState
          title={`No ${statusLabel} Tasks`}
          description={`You currently have no tasks marked with status "${statusLabel}".`}
          actionTitle="View All Tasks"
          onActionPress={() => setStatusFilter("ALL")}
        />
      );
    }

    return (
      <EmptyState
        title="No Assignments Found"
        description="You have no assigned pickup or delivery tasks at this time. Check back soon."
        actionTitle="Refresh List"
        onActionPress={loadAssignments}
      />
    );
  }, [selectedStatusFilter, setStatusFilter, loadAssignments]);

  return (
    <ScreenContainer scrollable={false} statusBarStyle="dark">
      <AppHeader
        title="Assignments"
        showBack={false}
      />

      {/* FILTER TABS */}
      <AssignmentFilterChips
        selectedTab={selectedStatusFilter}
        onSelectTab={setStatusFilter}
        counts={statusCounts}
      />

      {/* ERROR STATE */}
      {error && !refreshing && assignments.length === 0 ? (
        <ErrorState
          title="Unable to Load Assignments"
          message={error.message || "Failed to retrieve assignments."}
          retryText="Try Again"
          onRetry={loadAssignments}
        />
      ) : isFetchingAssignments && !refreshing && assignments.length === 0 ? (
        /* LOADING STATE */
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Loading assignments..."
          />
        </View>
      ) : (
        /* ASSIGNMENTS LIST */
        <FlatList
          data={filteredAssignments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  listContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    flexGrow: 1,
  },
});
