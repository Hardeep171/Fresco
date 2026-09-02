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
import { AdminStackParamList } from "../../types/navigation.types";
import { useAuth } from "../../hooks/useAuth";
import { useOrders } from "../../hooks/useOrders";
import { usePartnerAssignments } from "../../hooks/usePartnerAssignments";
import { useDeliveryTasks } from "../../hooks/useDeliveryTasks";
import {
  AppText,
  AppHeader,
  AppCard,
  AppBadge,
  AppLoader,
  ScreenContainer,
} from "../../components/common";
import { useTheme, colors, spacing, radius } from "../../theme";
import { formatCurrency, formatDate } from "../../utils/formatters";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminDashboardScreen">;

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { orders, loadAllOrders, isLoading: isOrdersLoading } = useOrders();
  const { assignments, loadAssignments, isFetchingAssignments } = usePartnerAssignments();
  const { tasks, loadTasks, isFetchingTasks } = useDeliveryTasks();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllOrders();
    loadAssignments();
    loadTasks();
  }, [loadAllOrders, loadAssignments, loadTasks]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadAllOrders(), loadAssignments(), loadTasks()]);
    setRefreshing(false);
  }, [loadAllOrders, loadAssignments, loadTasks]);

  // Operational metrics
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "DELIVERED"),
    [orders]
  );

  const activeAssignments = useMemo(
    () => assignments.filter((a) => a.status === "ASSIGNED" || a.status === "ACCEPTED"),
    [assignments]
  );

  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status === "PENDING" || t.status === "ACCEPTED"),
    [tasks]
  );

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0),
    [orders]
  );

  const adminName = user ? `${user.firstName} ${user.lastName}`.trim() : "Administrator";
  const roleBadge = user?.role || "ADMIN";

  const isLoading = (isOrdersLoading || isFetchingAssignments || isFetchingTasks) && !refreshing && orders.length === 0;

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Admin Operations"
        showBack={false}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <AppLoader variant="spinner" size="large" message="Loading admin operations..." />
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
          {/* ADMIN WELCOME BANNER */}
          <AppCard variant="elevated" padding="lg" style={styles.welcomeCard}>
            <View style={styles.welcomeRow}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.primarySurface }]}>
                <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
              </View>
              <View style={styles.welcomeTextCol}>
                <AppText variant="h2" color="primary">
                  {adminName}
                </AppText>
                <View style={styles.badgeRow}>
                  <AppBadge label={roleBadge} variant="primary" size="sm" />
                  <AppBadge label="SYSTEM LIVE" variant="success" size="sm" showDot />
                </View>
              </View>
            </View>
          </AppCard>

          {/* KPI METRIC TILES */}
          <AppText variant="label" color="secondary" style={styles.sectionTitle}>
            OPERATIONAL METRICS
          </AppText>

          <View style={styles.metricGrid}>
            <AppCard variant="outlined" padding="md" style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <AppText variant="caption" color="secondary">
                  Active Orders
                </AppText>
                <Ionicons name="receipt-outline" size={18} color={colors.primary} />
              </View>
              <AppText variant="h1" color="primary" style={styles.metricValue}>
                {activeOrders.length}
              </AppText>
              <AppText variant="caption" color="muted">
                {orders.length} total orders
              </AppText>
            </AppCard>

            <AppCard variant="outlined" padding="md" style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <AppText variant="caption" color="secondary">
                  Completed
                </AppText>
                <Ionicons name="checkmark-done-circle-outline" size={18} color={colors.success} />
              </View>
              <AppText variant="h1" color="success" style={styles.metricValue}>
                {completedOrders.length}
              </AppText>
              <AppText variant="caption" color="muted">
                Fulfilled deliveries
              </AppText>
            </AppCard>
          </View>

          <View style={styles.metricGrid}>
            <AppCard variant="outlined" padding="md" style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <AppText variant="caption" color="secondary">
                  Active Dispatches
                </AppText>
                <Ionicons name="bicycle-outline" size={18} color={colors.warning} />
              </View>
              <AppText variant="h1" color="primary" style={styles.metricValue}>
                {activeAssignments.length}
              </AppText>
              <AppText variant="caption" color="muted">
                {assignments.length} total assignments
              </AppText>
            </AppCard>

            <AppCard variant="outlined" padding="md" style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <AppText variant="caption" color="secondary">
                  Pending Tasks
                </AppText>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
              </View>
              <AppText variant="h1" color="brand" style={styles.metricValue}>
                {pendingTasks.length}
              </AppText>
              <AppText variant="caption" color="muted">
                {tasks.length} delivery tasks
              </AppText>
            </AppCard>
          </View>

          {/* REVENUE OVERVIEW */}
          <AppCard variant="outlined" padding="md" style={styles.revenueCard}>
            <View style={styles.revenueRow}>
              <View>
                <AppText variant="caption" color="secondary">
                  Total Managed Volume
                </AppText>
                <AppText variant="h2" color="primary" style={styles.revenueText}>
                  {formatCurrency(totalRevenue)}
                </AppText>
              </View>
              <View style={[styles.revenueIconBadge, { backgroundColor: colors.successSurface }]}>
                <Ionicons name="cash-outline" size={24} color={colors.success} />
              </View>
            </View>
          </AppCard>

          {/* RECENT ORDERS FEED */}
          <View style={styles.sectionHeaderRow}>
            <AppText variant="label" color="secondary" style={styles.sectionTitle}>
              RECENT ORDERS ({orders.length})
            </AppText>
          </View>

          {orders.length === 0 ? (
            <AppCard variant="outlined" padding="md" style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={36} color={colors.textMuted} />
              <AppText variant="bodyBold" color="primary" align="center" style={styles.emptyTitle}>
                No Orders Yet
              </AppText>
              <AppText variant="caption" color="secondary" align="center">
                Incoming customer orders will appear here in real time.
              </AppText>
            </AppCard>
          ) : (
            orders.slice(0, 5).map((order) => (
              <TouchableOpacity
                key={order._id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("OrderDetailsScreen", { orderId: order._id })}
                accessibilityRole="button"
                accessibilityLabel={`View order ${order._id.slice(-6)}`}
              >
                <AppCard variant="outlined" padding="md" style={styles.orderCard}>
                  <View style={styles.orderCardHeader}>
                    <View>
                      <AppText variant="bodyBold" color="primary">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </AppText>
                      <AppText variant="caption" color="secondary">
                        {formatDate(order.createdAt)}
                      </AppText>
                    </View>
                    <AppBadge
                      label={order.status}
                      variant={
                        order.status === "DELIVERED"
                          ? "success"
                          : order.status === "CANCELLED"
                          ? "error"
                          : "primary"
                      }
                      size="sm"
                    />
                  </View>

                  <View style={styles.orderCardFooter}>
                    <AppText variant="caption" color="muted">
                      {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"} •{" "}
                      {order.deliveryAddress?.city || "Local"}
                    </AppText>
                    <AppText variant="bodyBold" color="primary">
                      {formatCurrency(order.pricing?.totalAmount || 0)}
                    </AppText>
                  </View>
                </AppCard>
              </TouchableOpacity>
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
  welcomeCard: {
    marginBottom: spacing.lg,
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.round,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  welcomeTextCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  metricGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  metricValue: {
    marginBottom: 2,
  },
  revenueCard: {
    marginBottom: spacing.md,
  },
  revenueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueText: {
    marginTop: 2,
  },
  revenueIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  orderCard: {
    marginBottom: spacing.sm,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  orderCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs,
  },
});
