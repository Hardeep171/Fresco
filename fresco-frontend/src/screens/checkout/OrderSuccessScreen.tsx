import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { CartStackParamList } from "../../types/navigation.types";
import { ORDER_STATUS_LABELS } from "../../constants/order.constants";
import {
  AppText,
  AppButton,
  AppCard,
  AppBadge,
  AppDivider,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing, radius, shadows } from "../../theme";
import { formatCurrency, formatDate } from "../../utils/formatters";

type Props = NativeStackScreenProps<CartStackParamList, "OrderSuccessScreen">;

export const OrderSuccessScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { order } = route.params;

  const handleViewOrder = () => {
    (navigation.getParent() as any)?.navigate("OrdersTab", {
      screen: "OrderDetailsScreen",
      params: { orderId: order._id },
    });
  };

  const handleContinueShopping = () => {
    (navigation.getParent() as any)?.navigate("CatalogTab");
  };

  const statusLabel =
    ORDER_STATUS_LABELS[order.status] || order.status;

  return (
    <ScreenContainer scrollable statusBarStyle="dark">
      <View style={styles.contentContainer}>
        {/* SUCCESS ICON HEADER */}
        <View style={styles.iconCircle}>
          <Ionicons
            name="checkmark-circle"
            size={72}
            color={colors.success}
          />
        </View>

        <AppText variant="h1" color="primary" align="center" style={styles.title}>
          Order Placed Successfully!
        </AppText>
        <AppText
          variant="body"
          color="secondary"
          align="center"
          style={styles.subtitle}
        >
          Thank you for choosing FRESCO. Your laundry is now scheduled for pickup.
        </AppText>

        {/* ORDER DETAILS CARD */}
        <AppCard variant="elevated" padding="lg" style={styles.orderCard}>
          <View style={styles.orderHeaderRow}>
            <View>
              <AppText variant="caption" color="muted">
                ORDER ID
              </AppText>
              <AppText variant="bodyBold" color="primary">
                #{order._id.slice(-8).toUpperCase()}
              </AppText>
            </View>
            <AppBadge label={statusLabel} variant="primary" size="md" />
          </View>

          <AppDivider spacing="md" />

          {/* Items Summary */}
          <View style={styles.row}>
            <AppText variant="body" color="secondary">
              Items Scheduled:
            </AppText>
            <AppText variant="bodyMedium" color="primary">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} garments
            </AppText>
          </View>

          {/* Pickup Date */}
          {order.pickupDate ? (
            <View style={styles.row}>
              <AppText variant="body" color="secondary">
                Scheduled Pickup:
              </AppText>
              <AppText variant="bodyMedium" color="primary">
                {formatDate(order.pickupDate)}
              </AppText>
            </View>
          ) : null}

          {/* Pickup Address */}
          <View style={styles.row}>
            <AppText variant="body" color="secondary">
              Pickup Location:
            </AppText>
            <AppText
              variant="bodyMedium"
              color="primary"
              numberOfLines={1}
              style={styles.addressText}
            >
              {order.pickupAddress.addressLine1}, {order.pickupAddress.city}
            </AppText>
          </View>

          <AppDivider spacing="md" />

          {/* Total Amount */}
          <View style={styles.totalRow}>
            <AppText variant="bodyBold" color="primary">
              Total Amount:
            </AppText>
            <AppText variant="h2" color="brand">
              {formatCurrency(order.pricing.totalAmount)}
            </AppText>
          </View>
        </AppCard>

        {/* ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <AppButton
            title="View Order Details"
            variant="primary"
            size="lg"
            onPress={handleViewOrder}
            leftIcon={<Ionicons name="receipt-outline" size={20} color={colors.textInverse} />}
          />

          <AppButton
            title="Continue Shopping"
            variant="outline"
            size="md"
            onPress={handleContinueShopping}
            leftIcon={<Ionicons name="shirt-outline" size={20} color={colors.primary} />}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};


const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    paddingBottom: spacing.xxxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.round,
    backgroundColor: colors.successSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  orderCard: {
    width: "100%",
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  orderHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  addressText: {
    flex: 1,
    textAlign: "right",
    marginLeft: spacing.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionsContainer: {
    width: "100%",
    gap: spacing.sm,
  },
});
