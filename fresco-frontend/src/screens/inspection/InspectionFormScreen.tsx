import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useInspection } from "../../hooks/useInspection";
import { useOrders } from "../../hooks/useOrders";
import {
  AppText,
  AppHeader,
  AppCard,
  AppButton,
  AppInput,
  AppDivider,
  AppLoader,
  ScreenContainer,
} from "../../components/common";
import {
  InspectionConditionSelector,
} from "../../components/inspection";
import {
  InspectionItemInput,
  CreateInspectionInput,
} from "../../types/inspection.types";
import { OrderItem } from "../../types/order.types";
import {
  ItemCondition,
  INSPECTION_NOTES_MAX_LENGTH,
  INSPECTION_DAMAGE_NOTES_MAX_LENGTH,
  INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH,
} from "../../constants/inspection.constants";
import { OrdersStackParamList, PartnerStackParamList } from "../../types/navigation.types";
import { useTheme, colors, spacing, radius } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

type Props = NativeStackScreenProps<
  OrdersStackParamList | PartnerStackParamList,
  "InspectionFormScreen"
>;

interface FormItemState {
  garmentId: string;
  serviceId: string;
  garmentName: string;
  serviceName: string;
  initialQuantity: number;
  inspectedQuantity: number;
  unitPrice: number;
  condition: ItemCondition;
  damageNotes: string;
}

export const InspectionFormScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { colors } = useTheme();
  const { orderId } = route.params;

  const {
    currentInspection,
    isCreatingInspection,
    isUpdatingInspection,
    createError,
    updateError,
    createInspection,
    updateInspection,
    loadInspectionByOrderId,
    clearErrors,
  } = useInspection();

  const { currentOrder, loadOrderById } = useOrders();


  const [formItems, setFormItems] = useState<FormItemState[]>([]);
  const [overallNotes, setOverallNotes] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>("0");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load order and inspection on mount
  useEffect(() => {
    loadOrderById(orderId);
    loadInspectionByOrderId(orderId);
  }, [orderId, loadOrderById, loadInspectionByOrderId]);

  // Pre-fill form state when order or existing inspection is loaded
  useEffect(() => {
    if (!isInitialized && currentOrder) {
      if (currentInspection && currentInspection.items.length > 0) {
        // Pre-fill from existing DRAFT inspection
        const items: FormItemState[] = currentInspection.items.map((i) => ({
          garmentId: i.garmentId,
          serviceId: i.serviceId,
          garmentName: i.garmentName,
          serviceName: i.serviceName,
          initialQuantity: i.initialQuantity,
          inspectedQuantity: i.inspectedQuantity,
          unitPrice: i.unitPrice,
          condition: i.condition,
          damageNotes: i.damageNotes || "",
        }));
        setFormItems(items);
        setOverallNotes(currentInspection.notes || "");
        if (currentInspection.pricingSummary) {
          setAdjustmentAmount(
            String(currentInspection.pricingSummary.adjustmentAmount || 0)
          );
          setAdjustmentReason(
            currentInspection.pricingSummary.adjustmentReason || ""
          );
        }
      } else {
        // Initialize from order.items
        const items: FormItemState[] = currentOrder.items.map(
          (item: OrderItem) => ({
            garmentId: item.garmentId,
            serviceId: item.serviceId,
            garmentName: item.garmentName,
            serviceName: item.serviceName,
            initialQuantity: item.quantity,
            inspectedQuantity: item.quantity,
            unitPrice: item.unitPrice,
            condition: "NORMAL",
            damageNotes: "",
          })
        );
        setFormItems(items);


      }
      setIsInitialized(true);
    }
  }, [currentOrder, currentInspection, isInitialized]);

  const handleConditionChange = useCallback(
    (index: number, condition: ItemCondition) => {
      setFormItems((prev) => {
        const updated = [...prev];
        const currentItem = updated[index];
        if (currentItem) {
          updated[index] = {
            ...currentItem,
            condition,
          };
        }
        return updated;
      });
    },
    []
  );

  const handleQuantityChange = useCallback((index: number, delta: number) => {
    setFormItems((prev) => {
      const updated = [...prev];
      const currentItem = updated[index];
      if (currentItem) {
        const nextQty = Math.max(0, currentItem.inspectedQuantity + delta);
        updated[index] = {
          ...currentItem,
          inspectedQuantity: nextQty,
        };
      }
      return updated;
    });
  }, []);

  const handleDamageNotesChange = useCallback((index: number, notes: string) => {
    setFormItems((prev) => {
      const updated = [...prev];
      const currentItem = updated[index];
      if (currentItem) {
        updated[index] = {
          ...currentItem,
          damageNotes: notes.slice(0, INSPECTION_DAMAGE_NOTES_MAX_LENGTH),
        };
      }
      return updated;
    });
  }, []);

  const handleSave = useCallback(async () => {
    clearErrors();
    const itemsPayload: InspectionItemInput[] = formItems.map((item) => ({
      garmentId: item.garmentId,
      serviceId: item.serviceId,
      initialQuantity: item.initialQuantity,
      inspectedQuantity: item.inspectedQuantity,
      condition: item.condition,
      ...(item.damageNotes ? { damageNotes: item.damageNotes.trim() } : {}),
    }));

    const parsedAdj = parseFloat(adjustmentAmount) || 0;

    if (currentInspection && currentInspection._id) {
      const success = await updateInspection(currentInspection._id, {
        items: itemsPayload,
        adjustmentAmount: parsedAdj,
        ...(adjustmentReason ? { adjustmentReason: adjustmentReason.trim() } : {}),
        ...(overallNotes ? { notes: overallNotes.trim() } : {}),
      });

      if (success) {
        Alert.alert("Draft Saved", "Inspection draft updated successfully.", [
          {
            text: "View Summary",
            onPress: () =>
              navigation.replace("InspectionReviewScreen", { orderId }),
          },
        ]);
      }
    } else {
      const createPayload: CreateInspectionInput = {
        orderId,
        items: itemsPayload,
        adjustmentAmount: parsedAdj,
        ...(adjustmentReason ? { adjustmentReason: adjustmentReason.trim() } : {}),
        ...(overallNotes ? { notes: overallNotes.trim() } : {}),
      };

      const success = await createInspection(createPayload);
      if (success) {
        Alert.alert("Inspection Created", "Inspection recorded successfully.", [
          {
            text: "View Summary",
            onPress: () =>
              navigation.replace("InspectionReviewScreen", { orderId }),
          },
        ]);
      }
    }
  }, [
    clearErrors,
    formItems,
    adjustmentAmount,
    adjustmentReason,
    overallNotes,
    currentInspection,
    updateInspection,
    createInspection,
    orderId,
    navigation,
  ]);

  const isSubmitting = isCreatingInspection || isUpdatingInspection;
  const currentError = createError || updateError;
  const formattedOrderId = `#FRC-${orderId.slice(-8).toUpperCase()}`;

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Record Inspection"
        subtitle={formattedOrderId}
        onBackPress={() => navigation.goBack()}
      />

      {!isInitialized ? (
        <View style={styles.loadingContainer}>
          <AppLoader
            variant="spinner"
            size="large"
            message="Preparing inspection form..."
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ERROR BANNER */}
          {currentError ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorSurface }]}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <AppText variant="captionMedium" color="error" style={styles.errorText}>
                {currentError.message || "An error occurred while saving inspection."}
              </AppText>
            </View>
          ) : null}

          {/* OPERATIONAL GUIDELINES */}
          <View style={styles.guidelineCard}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <View style={styles.guidelineTextCol}>
              <AppText variant="bodyMedium" color="primary">
                Customer Presence Inspection
              </AppText>
              <AppText variant="caption" color="secondary">
                Inspect every garment in the order carefully. Record any pre-existing stains, damages, or color bleed risks before processing.
              </AppText>
            </View>
          </View>

          {/* GARMENTS RECORDING SECTION */}
          <View style={styles.sectionHeader}>
            <AppText variant="label" color="secondary">
              GARMENTS TO INSPECT ({formItems.length})
            </AppText>
          </View>

          {formItems.map((item, index) => (
            <AppCard
              key={`${item.garmentId}-${item.serviceId}-${index}`}
              variant="elevated"
              padding="md"
              style={styles.itemCard}
            >
              {/* ITEM HEADER */}
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleCol}>
                  <AppText variant="caption" color="muted">
                    GARMENT #{index + 1}
                  </AppText>
                  <AppText variant="h3" color="primary">
                    {item.garmentName}
                  </AppText>
                  <AppText variant="captionMedium" color="brand">
                    {item.serviceName} • {formatCurrency(item.unitPrice)} / piece
                  </AppText>
                </View>
              </View>

              {/* QUANTITY ADJUSTMENT ROW */}
              <View style={styles.quantityRow}>
                <View>
                  <AppText variant="caption" color="muted">
                    INITIAL QUANTITY
                  </AppText>
                  <AppText variant="bodyBold" color="secondary">
                    {item.initialQuantity} pcs
                  </AppText>
                </View>

                <View style={styles.stepperContainer}>
                  <AppText variant="caption" color="muted" style={styles.stepperLabel}>
                    INSPECTED QTY:
                  </AppText>
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(index, -1)}
                    style={styles.stepBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease quantity"
                  >
                    <Ionicons name="remove" size={18} color={colors.primary} />
                  </TouchableOpacity>

                  <AppText variant="bodyBold" color="primary" style={styles.qtyText}>
                    {item.inspectedQuantity}
                  </AppText>

                  <TouchableOpacity
                    onPress={() => handleQuantityChange(index, 1)}
                    style={styles.stepBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Increase quantity"
                  >
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <AppDivider spacing="sm" />

              {/* CONDITION SELECTION */}
              <AppText variant="captionMedium" color="primary" style={styles.conditionLabel}>
                Detected Condition:
              </AppText>
              <InspectionConditionSelector
                selectedCondition={item.condition}
                onSelectCondition={(condition) =>
                  handleConditionChange(index, condition)
                }
              />

              {/* DAMAGE NOTES INPUT (WHEN NOT NORMAL) */}
              {item.condition !== "NORMAL" ? (
                <View style={styles.damageInputContainer}>
                  <AppInput
                    label="Stain / Damage Location & Notes"
                    placeholder="e.g., Small coffee stain on front collar, loose left sleeve button"
                    value={item.damageNotes}
                    onChangeText={(text) =>
                      handleDamageNotesChange(
                        index,
                        text.slice(0, INSPECTION_DAMAGE_NOTES_MAX_LENGTH)
                      )
                    }
                    multiline
                  />
                </View>
              ) : null}
            </AppCard>
          ))}

          {/* FINANCIAL ADJUSTMENT SECTION */}
          <AppCard variant="outlined" padding="md" style={styles.adjustmentCard}>
            <AppText variant="label" color="secondary" style={styles.sectionTitle}>
              OPTIONAL CONDITION PRICING ADJUSTMENT
            </AppText>

            <AppInput
              label="Adjustment Amount (₹)"
              placeholder="0 (Positive for extra charge, negative for discount)"
              value={adjustmentAmount}
              onChangeText={setAdjustmentAmount}
              keyboardType="numeric"
            />

            <AppInput
              label="Adjustment Reason"
              placeholder="e.g. Heavy stain treatment required"
              value={adjustmentReason}
              onChangeText={(text) =>
                setAdjustmentReason(
                  text.slice(0, INSPECTION_ADJUSTMENT_REASON_MAX_LENGTH)
                )
              }
            />
          </AppCard>

          {/* OVERALL INSPECTOR NOTES */}
          <AppCard variant="outlined" padding="md" style={styles.overallNotesCard}>
            <AppText variant="label" color="secondary" style={styles.sectionTitle}>
              OVERALL INSPECTION NOTES
            </AppText>
            <AppInput
              label="Inspector General Observations"
              placeholder="Notes on fabric quality, customer instructions, or packing remarks..."
              value={overallNotes}
              onChangeText={(text) =>
                setOverallNotes(text.slice(0, INSPECTION_NOTES_MAX_LENGTH))
              }
              multiline
            />
          </AppCard>


          {/* SAVE BUTTON */}
          <View style={styles.actionContainer}>
            <AppButton
              title="Save & Proceed to Review"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={handleSave}
              leftIcon={
                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={20}
                  color={colors.textInverse}
                />
              }
            />
          </View>
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
  guidelineCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  guidelineTextCol: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  sectionHeader: {
    marginBottom: spacing.xs,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitleCol: {
    flex: 1,
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.xs,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepperLabel: {
    marginRight: spacing.xs,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    marginHorizontal: spacing.sm,
  },
  conditionLabel: {
    marginBottom: spacing.xs,
  },
  damageInputContainer: {
    marginTop: spacing.sm,
  },
  adjustmentCard: {
    marginBottom: spacing.md,
  },
  overallNotesCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  actionContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
