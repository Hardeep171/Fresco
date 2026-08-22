import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OrdersStackParamList } from "../../types/navigation.types";
import { Order } from "../../types/order.types";
import {
  OrderFilterTab,
  ORDER_STATUS_LABELS,
  OrderStatus,
} from "../../constants/order.constants";
import { useOrders } from "../../hooks/useOrders";
import {
  AppHeader,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import {
  OrderCard,
  OrderFilterChips,
} from "../../components/order";
import { colors, spacing } from "../../theme";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderHistoryScreen">;

export const OrderHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const {
    orders,
    isFetchingOrders,
    ordersError,
    selectedStatusFilter,
    loadUserOrders,
    setStatusFilter,
  } = useOrders();

  const [refreshing, setRefreshing] = useState(false);

  // Load orders on initial mount
  useEffect(() => {
    loadUserOrders();
  }, [loadUserOrders]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserOrders();
    setRefreshing(false);
  }, [loadUserOrders]);

  // Navigate to order details
  const handleOrderPress = useCallback(
    (order: Order) => {
      navigation.navigate("OrderDetailsScreen", { orderId: order._id });
    },
    [navigation]
  );

  // Compute count of orders per filter tab
  const statusCounts = useMemo(() => {
    const counts: Partial<Record<OrderFilterTab, number>> = {
      ALL: orders.length,
    };
    orders.forEach((order) => {
      const statusKey = order.status as OrderFilterTab;
      if (counts[statusKey] !== undefined) {
        counts[statusKey] = (counts[statusKey] || 0) + 1;
      } else {
        counts[statusKey] = 1;
      }
    });
    return counts;
  }, [orders]);


  // Filter orders according to selected tab
  const filteredOrders = useMemo(() => {
    if (selectedStatusFilter === "ALL") {
      return orders;
    }
    return orders.filter((order) => order.status === selectedStatusFilter);
  }, [orders, selectedStatusFilter]);

  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard order={item} onPress={handleOrderPress} />
    ),
    [handleOrderPress]
  );

  const renderEmptyState = useCallback(() => {
    if (selectedStatusFilter !== "ALL") {
      const statusLabel =
        ORDER_STATUS_LABELS[selectedStatusFilter as OrderStatus] ||
        selectedStatusFilter;
      return (
        <EmptyState
          title={`No ${statusLabel} Orders`}
          description={`You do not have any orders currently marked as "${statusLabel}".`}
          actionTitle="View All Orders"
          onActionPress={() => setStatusFilter("ALL")}
        />
      );
    }

    return (
      <EmptyState
        title="No Orders Yet"
        description="Your laundry journey starts here. Explore our dry cleaning, wash & fold, and steam press services."
        actionTitle="Browse Catalog"
        onActionPress={() => {
          (navigation.getParent() as any)?.navigate("CatalogTab");
        }}
      />
    );
  }, [selectedStatusFilter, setStatusFilter, navigation]);

  return (
    <ScreenContainer scrollable={false} statusBarStyle="dark">
      <AppHeader
        title="My Orders"
        showBack={false}
      />

      {/* FILTER TABS */}
      <OrderFilterChips
        selectedTab={selectedStatusFilter}
        onSelectTab={setStatusFilter}
        counts={statusCounts}
      />

      {/* ERROR STATE */}
      {ordersError && !refreshing && orders.length === 0 ? (
        <ErrorState
          title="Unable to Load Orders"
          message={ordersError.message || "Failed to retrieve your order history."}
          retryText="Try Again"
          onRetry={loadUserOrders}
        />
      ) : isFetchingOrders && !refreshing && orders.length === 0 ? (
        /* LOADING STATE */
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Loading your orders..."
          />
        </View>
      ) : (
        /* ORDERS LIST */
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
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
