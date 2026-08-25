import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PartnerStackParamList } from "../../types/navigation.types";
import { DeliveryTask } from "../../types/delivery-task.types";
import {
  TaskFilterTab,
  TASK_STATUS_LABELS,
  TaskStatus,
} from "../../constants/delivery-task.constants";
import { useDeliveryTasks } from "../../hooks/useDeliveryTasks";
import {
  AppHeader,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import {
  DeliveryTaskCard,
  DeliveryTaskFilterChips,
} from "../../components/partner";
import { useTheme, spacing } from "../../theme";

type Props = NativeStackScreenProps<PartnerStackParamList, "DeliveryTaskListScreen">;

export const DeliveryTaskListScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { colors } = useTheme();
  const initialFilter = route.params?.initialFilter as TaskFilterTab | undefined;

  const {
    tasks,
    isFetchingTasks,
    error,
    selectedStatusFilter,
    loadTasks,
    setStatusFilter,
  } = useDeliveryTasks();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter);
    }
    loadTasks();
  }, [initialFilter, setStatusFilter, loadTasks]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const handleTaskPress = useCallback(
    (task: DeliveryTask) => {
      navigation.navigate("DeliveryTaskDetailsScreen", {
        taskId: task._id,
      });
    },
    [navigation]
  );

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<TaskFilterTab, number>> = {
      ALL: tasks.length,
    };
    tasks.forEach((task) => {
      const statusKey = task.status as TaskFilterTab;
      counts[statusKey] = (counts[statusKey] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (selectedStatusFilter === "ALL") {
      return tasks;
    }
    return tasks.filter((task) => task.status === selectedStatusFilter);
  }, [tasks, selectedStatusFilter]);

  const renderItem = useCallback(
    ({ item }: { item: DeliveryTask }) => (
      <DeliveryTaskCard task={item} onPress={handleTaskPress} />
    ),
    [handleTaskPress]
  );

  const renderEmptyState = useCallback(() => {
    if (selectedStatusFilter !== "ALL") {
      const statusLabel =
        TASK_STATUS_LABELS[selectedStatusFilter as TaskStatus] ||
        selectedStatusFilter;
      return (
        <EmptyState
          title={`No ${statusLabel} Delivery Tasks`}
          description={`You have no delivery tasks marked with status "${statusLabel}".`}
          actionTitle="View All Tasks"
          onActionPress={() => setStatusFilter("ALL")}
        />
      );
    }

    return (
      <EmptyState
        title="No Delivery Tasks"
        description="No delivery tasks are currently assigned to your partner account."
        actionTitle="Refresh List"
        onActionPress={loadTasks}
      />
    );
  }, [selectedStatusFilter, setStatusFilter, loadTasks]);

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Delivery Tasks"
        showBack={false}
      />

      {/* FILTER TABS */}
      <DeliveryTaskFilterChips
        selectedTab={selectedStatusFilter}
        onSelectTab={setStatusFilter}
        counts={statusCounts}
      />

      {/* ERROR STATE */}
      {error && !refreshing && tasks.length === 0 ? (
        <ErrorState
          title="Unable to Load Tasks"
          message={error.message || "Failed to retrieve delivery tasks."}
          retryText="Try Again"
          onRetry={loadTasks}
        />
      ) : isFetchingTasks && !refreshing && tasks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Loading delivery tasks..."
          />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
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
