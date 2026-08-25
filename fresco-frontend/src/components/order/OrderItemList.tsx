import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderItem } from "../../types/order.types";
import { AppText, AppCard, AppDivider } from "../common";
import { useTheme, spacing, radius } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

export interface OrderItemListProps {
  items: OrderItem[];
}

export const OrderItemList: React.FC<OrderItemListProps> = ({ items }) => {
  const { colors } = useTheme();
  const totalGarments = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppCard variant="outlined" padding="md" style={styles.card}>
      <View style={styles.headerRow}>
        <AppText variant="label" color="secondary" style={styles.sectionTitle}>
          ITEMIZED ORDER RECEIPT
        </AppText>
        <AppText variant="captionMedium" color="muted">
          {totalGarments} {totalGarments === 1 ? "garment" : "garments"}
        </AppText>
      </View>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const formattedGarmentName =
          item.garmentName.charAt(0).toUpperCase() + item.garmentName.slice(1);
        const formattedServiceName =
          item.serviceName.charAt(0).toUpperCase() + item.serviceName.slice(1);

        return (
          <View key={`${item.garmentId}-${item.serviceId}-${index}`}>
            <View style={styles.itemRow}>
              {/* Garment Icon */}
              <View style={[styles.iconCircle, { backgroundColor: colors.primarySurface }]}>
                <Ionicons
                  name="shirt-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>

              {/* Details */}
              <View style={styles.detailsContainer}>
                <AppText
                  variant="bodyBold"
                  color="primary"
                  numberOfLines={1}
                  style={styles.garmentName}
                >
                  {formattedGarmentName}
                </AppText>

                <AppText
                  variant="caption"
                  color="secondary"
                  numberOfLines={1}
                  style={styles.serviceName}
                >
                  Service: {formattedServiceName}
                </AppText>

                <View style={styles.unitRow}>
                  <AppText variant="caption" color="muted">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </AppText>
                </View>
              </View>

              {/* Total item price */}
              <View style={styles.priceContainer}>
                <AppText variant="bodyBold" color="brand" align="right">
                  {formatCurrency(item.totalPrice)}
                </AppText>
              </View>
            </View>

            {!isLast && <AppDivider spacing="sm" />}
          </View>
        );
      })}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    letterSpacing: 0.8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  detailsContainer: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  garmentName: {
    marginBottom: 2,
  },
  serviceName: {
    marginBottom: 2,
  },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
