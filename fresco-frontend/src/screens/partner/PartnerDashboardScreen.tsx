import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { PartnerStackParamList } from "../../types/navigation.types";
import { useAuth } from "../../hooks/useAuth";
import { usePartnerAssignments } from "../../hooks/usePartnerAssignments";
import { useDeliveryTasks } from "../../hooks/useDeliveryTasks";
import {
  AppText,
  AppHeader,
  AppCard,
  AppLoader,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import {
  AssignmentCard,
  PartnerStatsHeader,
  DeliveryTaskCard,
} from "../../components/partner";
import { Assignment } from "../../types/assignment.types";
import { DeliveryTask } from "../../types/delivery-task.types";
import { useTheme, spacing } from "../../theme";

type Props = NativeStackScreenProps<PartnerStackParamList, "PartnerDashboardScreen">;

export const PartnerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    assignments,
    isFetchingAssignments,
    isAcceptingAssignment,
    isCompletingAssignment,
    error: assignmentsError,
    loadAssignments,
    acceptAssignment,
    completeAssignment,
  } = usePartnerAssignments();

  const {
    tasks,
    loadTasks,
  } = useDeliveryTasks();


  const [refreshing, setRefreshing] = useState(false);

  // Load assignments and tasks on mount
  useEffect(() => {
    loadAssignments();
    loadTasks();
  }, [loadAssignments, loadTasks]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadAssignments(), loadTasks()]);
    setRefreshing(false);
  }, [loadAssignments, loadTasks]);

  // Active counts
  const activePickups = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.assignmentType === "PICKUP" &&
          (a.status === "ASSIGNED" || a.status === "ACCEPTED")
      ),
    [assignments]
  );

  const activeDeliveries = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.assignmentType === "DELIVERY" &&
          (a.status === "ASSIGNED" || a.status === "ACCEPTED")
      ),
    [assignments]
  );

  const pendingActiveAssignments = useMemo(
    () =>
      assignments.filter(
        (a) => a.status === "ASSIGNED" || a.status === "ACCEPTED"
      ),
    [assignments]
  );

  const handleAssignmentPress = useCallback(
    (assignment: Assignment) => {
      navigation.navigate("AssignmentDetailsScreen", {
        assignmentId: assignment._id,
      });
    },
    [navigation]
  );

  const handleTaskPress = useCallback(
    (task: DeliveryTask) => {
      navigation.navigate("DeliveryTaskDetailsScreen", {
        taskId: task._id,
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

  const partnerFullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Delivery Partner";

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Partner Dashboard"
        showBack={false}
      />

      {assignmentsError && !refreshing && assignments.length === 0 ? (
        <ErrorState
          title="Unable to Load Partner Data"
          message={assignmentsError.message || "Failed to retrieve assignments."}
          retryText="Try Again"
          onRetry={handleRefresh}
        />
      ) : isFetchingAssignments && !refreshing && assignments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Loading partner dashboard..."
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* STATS HEADER */}
          <PartnerStatsHeader
            partnerName={partnerFullName}
            activePickupsCount={activePickups.length}
            activeDeliveriesCount={activeDeliveries.length}
            totalAssignmentsCount={assignments.length}
          />

          {/* ACTIVE ASSIGNMENTS SECTION */}
          <View style={styles.sectionHeaderRow}>
            <AppText variant="label" color="secondary" style={styles.sectionLabel}>
              ACTIVE ASSIGNMENTS ({pendingActiveAssignments.length})
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate("AssignmentListScreen")}
              accessibilityRole="button"
              accessibilityLabel="View all assignments"
            >
              <AppText variant="captionMedium" color="brand">
                View All
              </AppText>
            </TouchableOpacity>
          </View>

          {pendingActiveAssignments.length === 0 ? (
            <AppCard variant="outlined" padding="md" style={styles.emptyCard}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={36}
                color={colors.success}
                style={styles.emptyIcon}
              />
              <AppText variant="bodyBold" color="primary" align="center">
                All Caught Up!
              </AppText>
              <AppText variant="caption" color="secondary" align="center">
                No active pickup or delivery assignments right now.
              </AppText>
            </AppCard>
          ) : (
            pendingActiveAssignments.slice(0, 3).map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                onPress={handleAssignmentPress}
                onAccept={handleAccept}
                onComplete={handleComplete}
                isActionLoading={isAcceptingAssignment || isCompletingAssignment}
              />
            ))
          )}

          {/* RECENT DELIVERY TASKS SECTION */}
          <View style={[styles.sectionHeaderRow, styles.taskSectionSpacing]}>
            <AppText variant="label" color="secondary" style={styles.sectionLabel}>
              RECENT DELIVERY TASKS ({tasks.length})
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate("DeliveryTaskListScreen")}
              accessibilityRole="button"
              accessibilityLabel="View all delivery tasks"
            >
              <AppText variant="captionMedium" color="brand">
                View All
              </AppText>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <AppCard variant="outlined" padding="md" style={styles.emptyCard}>
              <Ionicons
                name="bicycle-outline"
                size={36}
                color={colors.textMuted}
                style={styles.emptyIcon}
              />
              <AppText variant="bodyBold" color="primary" align="center">
                No Delivery Tasks
              </AppText>
              <AppText variant="caption" color="secondary" align="center">
                Delivery task logs will appear here once tasks are created.
              </AppText>
            </AppCard>
          ) : (
            tasks.slice(0, 2).map((task) => (
              <DeliveryTaskCard
                key={task._id}
                task={task}
                onPress={handleTaskPress}
              />
            ))
          )}
        </ScrollView>
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
  scrollContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    letterSpacing: 0.8,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyIcon: {
    marginBottom: spacing.xs,
  },
  taskSectionSpacing: {
    marginTop: spacing.md,
  },
});
