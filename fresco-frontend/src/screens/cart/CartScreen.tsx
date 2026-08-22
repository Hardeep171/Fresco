import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { CartStackParamList } from "../../types/navigation.types";
import { useCart } from "../../hooks/useCart";
import { useCatalog } from "../../hooks/useCatalog";
import { EnrichedCartItem } from "../../types/cart.types";
import { CartItemCard, CartSummaryCard } from "../../components/cart";
import {
  AppHeader,
  AppText,
  AppButton,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

type Props = NativeStackScreenProps<CartStackParamList, "CartScreen">;

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const {
    items,
    enrichedItems,
    totalAmount,
    totalItemCount,
    isLoading: isCartLoading,
    isMutating,
    mutatingItemId,
    error,
    loadCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const { loadInitialCatalog, loadGarments } = useCatalog();
  const [refreshing, setRefreshing] = useState(false);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadCart(),
      loadInitialCatalog(),
      loadGarments({ isActive: true }),
    ]);
  }, [loadCart, loadInitialCatalog, loadGarments]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  const handleIncrement = (item: EnrichedCartItem) => {
    if (!item._id) return;
    updateQuantity(item._id, item.quantity + 1);
  };

  const handleDecrement = (item: EnrichedCartItem) => {
    if (!item._id || item.quantity <= 1) return;
    updateQuantity(item._id, item.quantity - 1);
  };

  const handleRemove = (item: EnrichedCartItem) => {
    if (!item._id) return;
    Alert.alert(
      "Remove Item",
      `Remove ${item.garmentName} (${item.serviceName}) from your cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => item._id && removeItem(item._id),
        },
      ]
    );
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your laundry cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const handleProceedToCheckout = () => {
    navigation.navigate("CheckoutScreen");
  };

  const handleBrowseCatalog = () => {
    (navigation.getParent() as any)?.navigate("CatalogTab");
  };

  return (
    <ScreenContainer
      scrollable
      statusBarStyle="dark"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <AppHeader
        title="My Laundry Cart"
        subtitle={
          totalItemCount > 0
            ? `${totalItemCount} ${totalItemCount === 1 ? "item" : "items"} scheduled`
            : "No items in cart"
        }
        showBack={false}
        rightAction={
          items.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClearCart}
              style={styles.clearCartButton}
              accessibilityRole="button"
              accessibilityLabel="Clear entire cart"
            >
              <AppText variant="captionMedium" color="error">
                Clear
              </AppText>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Cart Content */}
      {isCartLoading && !refreshing && items.length === 0 ? (
        <AppLoader message="Loading cart items..." style={styles.loader} />
      ) : error && items.length === 0 ? (
        <ErrorState
          title="Could Not Load Cart"
          message={error.message}
          onRetry={loadAllData}
          style={styles.errorState}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="cart-outline" size={56} color={colors.primary} />}
          title="Your Cart is Empty"
          description="Browse our fabric care catalog and add your clothes, bedding, or delicates for cleaning."
          actionTitle="Browse Catalog"
          onActionPress={handleBrowseCatalog}
          style={styles.emptyState}
        />
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.sectionHeader}>
            <AppText variant="label" color="secondary">
              ITEMS IN CART ({totalItemCount})
            </AppText>
          </View>

          {/* Cart Item Cards */}
          {enrichedItems.map((item, index) => (
            <CartItemCard
              key={item._id || `${item.garmentId}-${item.serviceId}-${index}`}
              item={item}
              isMutating={isMutating && mutatingItemId === item._id}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemove}
            />
          ))}

          {/* Authoritative Bill Summary */}
          <CartSummaryCard totalAmount={totalAmount} itemCount={totalItemCount} />

          {/* Checkout CTA Button */}
          <View style={styles.ctaContainer}>
            <AppButton
              title={`Proceed to Checkout • ${formatCurrency(totalAmount)}`}
              variant="primary"
              size="lg"
              onPress={handleProceedToCheckout}
              rightIcon={
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.textInverse}
                />
              }
            />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  clearCartButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  contentContainer: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  ctaContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.xxxl,
  },
  errorState: {
    marginTop: spacing.xxl,
  },
  emptyState: {
    marginTop: spacing.xl,
  },
});
