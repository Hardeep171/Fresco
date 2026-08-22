import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { CartStackParamList } from "../../types/navigation.types";
import { useCheckout } from "../../hooks/useCheckout";
import { useCart } from "../../hooks/useCart";
import { useOrders } from "../../hooks/useOrders";
import { CartSummaryCard } from "../../components/cart";
import {
  AppHeader,
  AppText,
  AppButton,
  AppCard,
  AppBadge,
  AppDivider,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing, shadows } from "../../theme";
import { formatDate, formatCurrency } from "../../utils/formatters";

type Props = NativeStackScreenProps<CartStackParamList, "OrderReviewScreen">;

export const OrderReviewScreen: React.FC<Props> = ({ navigation }) => {
  const {
    pickupAddress,
    deliveryAddress,
    pickupDate,
    deliveryDate,
    specialInstructions,
    buildOrderPayload,
  } = useCheckout();

  const { enrichedItems, totalAmount, totalItemCount } = useCart();
  const { isPlacingOrder, placeOrderError, placeOrder } = useOrders();

  // Double-submission protection ref
  const isSubmittingRef = useRef(false);

  const handlePlaceOrder = async () => {
    if (isSubmittingRef.current || isPlacingOrder) {
      return;
    }

    const payload = buildOrderPayload();
    if (!payload) {
      Alert.alert("Incomplete Order", "Please complete all required fields.");
      return;
    }

    isSubmittingRef.current = true;

    try {
      const createdOrder = await placeOrder(payload);
      if (createdOrder) {
        navigation.replace("OrderSuccessScreen", { order: createdOrder });
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <ScreenContainer scrollable statusBarStyle="dark">
      <AppHeader
        title="Review & Confirm"
        subtitle="Verify order details before placing"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.contentContainer}>
        {/* ERROR BANNER */}
        {placeOrderError && (
          <AppCard variant="outlined" padding="sm" style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <AppText variant="caption" color="error" style={styles.errorText}>
              {placeOrderError.message || "Failed to place order. Please try again."}
            </AppText>
          </AppCard>
        )}

        {/* SECTION 1: ITEMS SUMMARY */}
        <AppCard variant="elevated" padding="md" style={styles.sectionCard}>
          <View style={styles.headerRow}>
            <Ionicons name="shirt-outline" size={20} color={colors.primary} />
            <AppText variant="bodyBold" color="primary" style={styles.sectionTitle}>
              Garments & Services ({totalItemCount})
            </AppText>
          </View>

          <AppDivider spacing="sm" />

          {enrichedItems.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <AppText variant="bodyMedium" color="primary">
                  {item.quantity} × {item.garmentName}
                </AppText>
                <AppText variant="caption" color="secondary">
                  Service: {item.serviceName}
                </AppText>
              </View>
              <AppText variant="bodyMedium" color="brand">
                {formatCurrency(item.subtotal)}
              </AppText>
            </View>
          ))}
        </AppCard>

        {/* SECTION 2: ADDRESSES */}
        <AppCard variant="elevated" padding="md" style={styles.sectionCard}>
          <View style={styles.headerRow}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <AppText variant="bodyBold" color="primary" style={styles.sectionTitle}>
              Pickup & Delivery Locations
            </AppText>
          </View>

          <AppDivider spacing="sm" />

          {/* Pickup Address */}
          <View style={styles.addressBlock}>
            <View style={styles.badgeRow}>
              <AppBadge label="PICKUP" variant="primary" size="sm" />
              {pickupAddress?.label && (
                <AppBadge
                  label={pickupAddress.label}
                  variant="info"
                  size="sm"
                  style={styles.labelBadge}
                />
              )}
            </View>
            <AppText variant="bodyMedium" color="primary">
              {pickupAddress?.fullName} • {pickupAddress?.phone}
            </AppText>
            <AppText variant="caption" color="secondary">
              {pickupAddress?.addressLine1}, {pickupAddress?.city} - {pickupAddress?.postalCode}
            </AppText>
          </View>

          <AppDivider spacing="xs" />

          {/* Delivery Address */}
          <View style={styles.addressBlock}>
            <View style={styles.badgeRow}>
              <AppBadge label="DELIVERY" variant="success" size="sm" />
              {deliveryAddress?.label && (
                <AppBadge
                  label={deliveryAddress.label}
                  variant="info"
                  size="sm"
                  style={styles.labelBadge}
                />
              )}
            </View>
            <AppText variant="bodyMedium" color="primary">
              {deliveryAddress?.fullName} • {deliveryAddress?.phone}
            </AppText>
            <AppText variant="caption" color="secondary">
              {deliveryAddress?.addressLine1}, {deliveryAddress?.city} - {deliveryAddress?.postalCode}
            </AppText>
          </View>
        </AppCard>

        {/* SECTION 3: SCHEDULE */}
        <AppCard variant="elevated" padding="md" style={styles.sectionCard}>
          <View style={styles.headerRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <AppText variant="bodyBold" color="primary" style={styles.sectionTitle}>
              Service Schedule
            </AppText>
          </View>

          <AppDivider spacing="sm" />

          <View style={styles.scheduleRow}>
            <AppText variant="body" color="secondary">
              Scheduled Pickup:
            </AppText>
            <AppText variant="bodyMedium" color="primary">
              {formatDate(pickupDate)}
            </AppText>
          </View>

          <View style={styles.scheduleRow}>
            <AppText variant="body" color="secondary">
              Estimated Delivery:
            </AppText>
            <AppText variant="bodyMedium" color="primary">
              {formatDate(deliveryDate)}
            </AppText>
          </View>
        </AppCard>

        {/* SECTION 4: SPECIAL INSTRUCTIONS */}
        {specialInstructions ? (
          <AppCard variant="elevated" padding="md" style={styles.sectionCard}>
            <View style={styles.headerRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
              <AppText variant="bodyBold" color="primary" style={styles.sectionTitle}>
                Care Instructions
              </AppText>
            </View>
            <AppDivider spacing="sm" />
            <AppText variant="body" color="secondary">
              "{specialInstructions}"
            </AppText>
          </AppCard>
        ) : null}

        {/* SECTION 5: BILL SUMMARY */}
        <CartSummaryCard totalAmount={totalAmount} itemCount={totalItemCount} />

        {/* PLACE ORDER CTA */}
        <View style={styles.ctaContainer}>
          <AppButton
            title={`Place Order • ${formatCurrency(totalAmount)}`}
            variant="primary"
            size="lg"
            loading={isPlacingOrder}
            disabled={isPlacingOrder}
            onPress={handlePlaceOrder}
            leftIcon={<Ionicons name="checkmark-circle" size={22} color={colors.textInverse} />}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorSurface,
    borderColor: colors.error,
    marginBottom: spacing.md,
  },
  errorText: {
    marginLeft: spacing.xs,
    flex: 1,
  },
  sectionCard: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    marginLeft: spacing.xs,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  itemInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  addressBlock: {
    paddingVertical: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxs,
  },
  labelBadge: {
    marginLeft: spacing.xs,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  ctaContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
