import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { OrdersStackParamList } from "../../types/navigation.types";
import { useAuth } from "../../hooks/useAuth";
import { useInspection } from "../../hooks/useInspection";
import { useOrders } from "../../hooks/useOrders";
import {
  AppText,
  AppHeader,
  AppCard,
  AppButton,
  AppDivider,
  AppLoader,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import {
  InspectionItemFindingCard,
  InspectionPricingSummaryCard,
  InspectionStatusBadge,
} from "../../components/inspection";
import { colors, spacing, radius } from "../../theme";
import { formatDateTime, formatCurrency } from "../../utils/formatters";

type Props = NativeStackScreenProps<OrdersStackParamList, "InspectionReviewScreen">;

export const InspectionReviewScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { orderId, inspectionId } = route.params;
  const { user } = useAuth();
  const {
    currentInspection,
    isFetchingInspection,
    isSubmittingInspection,
    submitError,
    loadInspectionByOrderId,
    loadInspectionById,
    submitInspection,
    clearErrors,
  } = useInspection();

  const { loadOrderById } = useOrders();
  const [refreshing, setRefreshing] = useState(false);


  const isStaffRole = useMemo(() => {
    const role = user?.role;
    return (
      role === "ADMIN" ||
      role === "SUPER_ADMIN" ||
      role === "CITY_MANAGER" ||
      role === "BRANCH_MANAGER"
    );
  }, [user?.role]);

  // Load inspection & order
  useEffect(() => {
    if (orderId) {
      loadInspectionByOrderId(orderId);
      loadOrderById(orderId);
    } else if (inspectionId) {
      loadInspectionById(inspectionId);
    }
  }, [orderId, inspectionId, loadInspectionByOrderId, loadInspectionById, loadOrderById]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (orderId) {
      await Promise.all([loadInspectionByOrderId(orderId), loadOrderById(orderId)]);
    } else if (inspectionId) {
      await loadInspectionById(inspectionId);
    }
    setRefreshing(false);
  }, [orderId, inspectionId, loadInspectionByOrderId, loadInspectionById, loadOrderById]);

  const handleSubmit = useCallback(() => {
    if (!currentInspection?._id || isSubmittingInspection) return;

    Alert.alert(
      "Submit Inspection",
      "Are you sure you want to submit this inspection? The order status will transition to Processing (IN_PROCESS).",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Submit Inspection",
          onPress: async () => {
            clearErrors();
            const success = await submitInspection(currentInspection._id);
            if (success && orderId) {
              await loadOrderById(orderId);
            }
          },
        },
      ]
    );
  }, [
    currentInspection?._id,
    isSubmittingInspection,
    clearErrors,
    submitInspection,
    orderId,
    loadOrderById,
  ]);

  const inspection = currentInspection;
  const formattedOrderId = orderId ? `#FRC-${orderId.slice(-8).toUpperCase()}` : "N/A";
  const isDraft = inspection?.status === "DRAFT";
  const isSubmitted = inspection?.status === "SUBMITTED" || inspection?.status === "APPROVED";

  return (
    <ScreenContainer scrollable={false} statusBarStyle="dark">
      <AppHeader
        title="Inspection Report"
        subtitle={formattedOrderId}
        onBackPress={() => navigation.goBack()}
      />

      {isFetchingInspection && !refreshing && !inspection ? (
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Loading inspection report..."
          />
        </View>
      ) : !inspection ? (
        <ErrorState
          title="No Inspection Record Found"
          message="An inspection report is not yet available for this order. Garments are inspected prior to workshop processing."
          retryText="Try Again"
          onRetry={handleRefresh}
        />
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
          {/* SUBMIT ERROR BANNER */}
          {submitError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <AppText variant="captionMedium" color="error" style={styles.errorText}>
                {submitError.message || "Failed to submit inspection."}
              </AppText>
            </View>
          ) : null}

          {/* STATUS BANNER */}
          <AppCard
            variant={isSubmitted ? "elevated" : "outlined"}
            padding="md"
            style={StyleSheet.flatten([
              styles.statusBannerCard,
              isSubmitted ? styles.submittedBanner : null,
            ])}
          >

            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <AppText variant="caption" color="muted">
                  INSPECTION STATUS
                </AppText>
                <AppText variant="h2" color="primary">
                  {isSubmitted
                    ? "✓ Inspection Completed"
                    : "Inspection In Progress"}
                </AppText>
                <AppText
                  variant="caption"
                  color="secondary"
                  style={styles.statusDesc}
                >
                  {isSubmitted
                    ? "Garments were inspected before processing."
                    : "Garments are currently undergoing inspection."}
                </AppText>
              </View>

              <InspectionStatusBadge status={inspection.status} size="sm" />
            </View>
          </AppCard>

          {/* OPERATIONAL NOTICE */}
          <View style={styles.noticeContainer}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.primary}
              style={styles.noticeIcon}
            />
            <AppText
              variant="caption"
              color="secondary"
              style={styles.noticeText}
            >
              Garment inspections are performed in the customer's presence to verify fabric conditions and pre-existing stains prior to workshop processing.
            </AppText>
          </View>

          {/* INSPECTED GARMENTS LIST */}
          <View style={styles.sectionHeaderRow}>
            <AppText variant="label" color="secondary" style={styles.sectionLabel}>
              INSPECTED GARMENTS ({inspection.items.length})
            </AppText>
          </View>

          {inspection.items.map((item, idx) => (
            <InspectionItemFindingCard
              key={`${item.garmentId}-${item.serviceId}-${idx}`}
              item={item}
              index={idx}
            />
          ))}

          {/* EXTRA SERVICES IF PRESENT */}
          {inspection.extraServices && inspection.extraServices.length > 0 ? (
            <AppCard variant="outlined" padding="md" style={styles.extraServicesCard}>
              <AppText variant="label" color="secondary" style={styles.sectionLabel}>
                ADDITIONAL SERVICES ADDED ({inspection.extraServices.length})
              </AppText>
              {inspection.extraServices.map((extra, extraIdx) => (
                <View
                  key={`${extra.serviceName}-${extraIdx}`}
                  style={styles.extraServiceRow}
                >
                  <AppText variant="body" color="primary">
                    {extra.serviceName}
                  </AppText>
                  <AppText variant="bodyBold" color="brand">
                    {formatCurrency(extra.price)}
                  </AppText>
                </View>
              ))}
            </AppCard>
          ) : null}

          {/* PRICING SUMMARY */}
          {inspection.pricingSummary ? (
            <InspectionPricingSummaryCard pricing={inspection.pricingSummary} />
          ) : null}

          {/* INSPECTION METADATA & NOTES */}
          <AppCard variant="outlined" padding="md" style={styles.metaCard}>
            <AppText variant="label" color="secondary" style={styles.sectionLabel}>
              INSPECTION TIMESTAMPS & NOTES
            </AppText>

            {inspection.inspectedAt ? (
              <View style={styles.metaRow}>
                <AppText variant="body" color="secondary">
                  Inspected At:
                </AppText>
                <AppText variant="captionMedium" color="primary">
                  {formatDateTime(inspection.inspectedAt)}
                </AppText>
              </View>
            ) : null}

            {inspection.submittedAt ? (
              <View style={styles.metaRow}>
                <AppText variant="body" color="secondary">
                  Completed At:
                </AppText>
                <AppText variant="captionMedium" color="success">
                  {formatDateTime(inspection.submittedAt)}
                </AppText>
              </View>
            ) : null}

            {inspection.notes ? (
              <>
                <AppDivider spacing="sm" />
                <AppText variant="caption" color="muted">
                  Special Inspection Notes:
                </AppText>
                <AppText variant="body" color="primary" style={styles.notesBody}>
                  "{inspection.notes}"
                </AppText>
              </>
            ) : null}
          </AppCard>

          {/* STAFF ACTION BUTTONS */}
          {isStaffRole && isDraft ? (
            <View style={styles.actionsContainer}>
              <AppButton
                title="Submit Inspection"
                variant="primary"
                size="lg"
                loading={isSubmittingInspection}
                disabled={isSubmittingInspection}
                onPress={handleSubmit}
                leftIcon={
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={colors.textInverse}
                  />
                }
              />
            </View>
          ) : null}
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
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    marginLeft: spacing.xs,
    flex: 1,
  },
  statusBannerCard: {
    marginBottom: spacing.sm,
  },
  submittedBanner: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  statusDesc: {
    marginTop: 2,
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  noticeIcon: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    letterSpacing: 0.8,
  },
  extraServicesCard: {
    marginBottom: spacing.md,
  },
  extraServiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  metaCard: {
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxs,
  },
  notesBody: {
    marginTop: 2,
    fontStyle: "italic",
  },
  actionsContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
