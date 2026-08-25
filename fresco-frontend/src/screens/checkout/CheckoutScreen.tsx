import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { CartStackParamList } from "../../types/navigation.types";
import { useCheckout } from "../../hooks/useCheckout";
import { useAddress } from "../../hooks/useAddress";
import { Address } from "../../types/address.types";
import {
  AppHeader,
  AppText,
  AppButton,
  AppCard,
  AppBadge,
  AppInput,
  AppDivider,
  ScreenContainer,
} from "../../components/common";
import { useTheme, colors, spacing, radius, shadows } from "../../theme";
import { formatDate } from "../../utils/formatters";

type Props = NativeStackScreenProps<CartStackParamList, "CheckoutScreen">;

export const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    addresses,
    pickupAddress,
    setPickupAddress,
    deliveryAddress,
    setDeliveryAddress,
    useSameAddress,
    setUseSameAddress,
    pickupDate,
    setPickupDate,
    deliveryDate,
    setDeliveryDate,
    specialInstructions,
    setSpecialInstructions,
    items,
    canProceedToReview,
  } = useCheckout();

  const { selectedAddress: _ } = useAddress();

  const [addressModalType, setAddressModalType] = useState<
    "pickup" | "delivery" | null
  >(null);

  // Generate dynamic date options
  const pickupDateOptions = [
    { label: "Tomorrow", date: new Date(Date.now() + 86400000) },
    { label: "In 2 Days", date: new Date(Date.now() + 2 * 86400000) },
    { label: "In 3 Days", date: new Date(Date.now() + 3 * 86400000) },
  ];

  const deliveryDateOptions = [
    { label: "Standard (3 Days)", date: new Date(Date.now() + 3 * 86400000) },
    { label: "Express (4 Days)", date: new Date(Date.now() + 4 * 86400000) },
    { label: "Flexible (5 Days)", date: new Date(Date.now() + 5 * 86400000) },
  ];

  const handleSelectAddressFromList = (addr: Address) => {
    if (addressModalType === "pickup") {
      setPickupAddress(addr);
      if (useSameAddress) {
        setDeliveryAddress(addr);
      }
    } else if (addressModalType === "delivery") {
      setDeliveryAddress(addr);
    }
    setAddressModalType(null);
  };

  const handleAddNewAddress = () => {
    setAddressModalType(null);
    (navigation.getParent() as any)?.navigate("ProfileTab", {
      screen: "AddAddressScreen",
    });
  };

  const handleProceedToReview = () => {
    if (items.length === 0) {
      Alert.alert("Empty Cart", "Your cart contains no items.");
      return;
    }
    if (!pickupAddress) {
      Alert.alert("Missing Address", "Please select a pickup address.");
      return;
    }
    if (!deliveryAddress) {
      Alert.alert("Missing Address", "Please select a delivery address.");
      return;
    }

    navigation.navigate("OrderReviewScreen");
  };

  const renderAddressCard = (
    title: string,
    address: Address | null,
    onPressChange: () => void
  ) => {
    return (
      <AppCard variant="elevated" padding="md" style={styles.addressCard}>
        <View style={styles.addressHeaderRow}>
          <View style={styles.addressTitleGroup}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <AppText variant="bodyBold" color="primary" style={styles.addressSectionTitle}>
              {title}
            </AppText>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressChange}
            style={styles.changeAddressBtn}
            accessibilityRole="button"
          >
            <AppText variant="captionMedium" color="brand">
              {address ? "Change" : "Select"}
            </AppText>
          </TouchableOpacity>
        </View>

        {address ? (
          <View style={styles.addressDetails}>
            <View style={styles.badgeRow}>
              <AppBadge label={address.label} variant="primary" size="sm" />
              {address.isDefault && (
                <AppBadge
                  label="DEFAULT"
                  variant="success"
                  size="sm"
                  style={styles.defaultBadge}
                />
              )}
            </View>

            <AppText variant="bodyMedium" color="primary" style={styles.nameText}>
              {address.fullName} • {address.phone}
            </AppText>
            <AppText variant="body" color="secondary">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ""}
            </AppText>
            {address.landmark ? (
              <AppText variant="caption" color="muted">
                Landmark: {address.landmark}
              </AppText>
            ) : null}
            <AppText variant="caption" color="secondary">
              {address.city}, {address.state} - {address.postalCode}
            </AppText>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressChange}
            style={styles.selectAddressPrompt}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <AppText variant="bodyMedium" color="brand" style={styles.promptText}>
              Choose or Add Address
            </AppText>
          </TouchableOpacity>
        )}
      </AppCard>
    );
  };

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Checkout"
        subtitle="Address & Schedule Selection"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.contentContainer}>
        {/* SECTION 1: PICKUP ADDRESS */}
        {renderAddressCard("Pickup Address", pickupAddress, () =>
          setAddressModalType("pickup")
        )}

        {/* SAME ADDRESS CHECKBOX */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setUseSameAddress(!useSameAddress)}
          style={styles.sameAddressToggle}
        >
          <Ionicons
            name={useSameAddress ? "checkbox" : "square-outline"}
            size={22}
            color={useSameAddress ? colors.primary : colors.textMuted}
          />
          <AppText variant="body" color="primary" style={styles.sameAddressLabel}>
            Use same address for delivery
          </AppText>
        </TouchableOpacity>

        {/* SECTION 2: DELIVERY ADDRESS (if distinct) */}
        {!useSameAddress &&
          renderAddressCard("Delivery Address", deliveryAddress, () =>
            setAddressModalType("delivery")
          )}

        {/* SECTION 3: PICKUP SCHEDULE */}
        <AppCard variant="elevated" padding="md" style={styles.scheduleCard}>
          <View style={styles.scheduleHeaderRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <AppText variant="bodyBold" color="primary" style={styles.scheduleTitle}>
              Doorstep Pickup Date
            </AppText>
          </View>
          <AppText variant="caption" color="secondary" style={styles.scheduleSubtitle}>
            Our delivery partner will collect your garments on:
          </AppText>

          <View style={styles.pillsContainer}>
            {pickupDateOptions.map((opt, idx) => {
              const iso = opt.date.toISOString();
              const isSelected =
                new Date(pickupDate).toDateString() === opt.date.toDateString();

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setPickupDate(iso)}
                  style={[
                    styles.datePill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <AppText
                    variant="captionMedium"
                    color={isSelected ? "inverse" : "primary"}
                  >
                    {opt.label}
                  </AppText>
                  <AppText
                    variant="caption"
                    color={isSelected ? "inverse" : "secondary"}
                  >
                    {formatDate(opt.date)}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </AppCard>

        {/* SECTION 4: DELIVERY SCHEDULE */}
        <AppCard variant="elevated" padding="md" style={styles.scheduleCard}>
          <View style={styles.scheduleHeaderRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <AppText variant="bodyBold" color="primary" style={styles.scheduleTitle}>
              Estimated Delivery Date
            </AppText>
          </View>
          <AppText variant="caption" color="secondary" style={styles.scheduleSubtitle}>
            Your fresh, clean garments will be delivered by:
          </AppText>

          <View style={styles.pillsContainer}>
            {deliveryDateOptions.map((opt, idx) => {
              const iso = opt.date.toISOString();
              const isSelected =
                new Date(deliveryDate).toDateString() === opt.date.toDateString();

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setDeliveryDate(iso)}
                  style={[
                    styles.datePill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <AppText
                    variant="captionMedium"
                    color={isSelected ? "inverse" : "primary"}
                  >
                    {opt.label}
                  </AppText>
                  <AppText
                    variant="caption"
                    color={isSelected ? "inverse" : "secondary"}
                  >
                    {formatDate(opt.date)}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </AppCard>

        {/* SECTION 5: SPECIAL INSTRUCTIONS */}
        <AppCard variant="elevated" padding="md" style={styles.instructionsCard}>
          <View style={styles.scheduleHeaderRow}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <AppText variant="bodyBold" color="primary" style={styles.scheduleTitle}>
              Special Instructions (Optional)
            </AppText>
          </View>
          <AppText variant="caption" color="secondary" style={styles.scheduleSubtitle}>
            Specific fabric care notes, stain warnings, or gate codes:
          </AppText>

          <AppInput
            placeholder="e.g. Please starch cotton shirts; ring doorbell 204."
            value={specialInstructions}
            onChangeText={(text) => setSpecialInstructions(text.slice(0, 500))}
            multiline
            numberOfLines={3}
            style={styles.instructionsInput}
          />
        </AppCard>

        {/* REVIEW ORDER CTA */}
        <View style={styles.ctaContainer}>
          <AppButton
            title="Review Order"
            variant="primary"
            size="lg"
            disabled={!canProceedToReview}
            onPress={handleProceedToReview}
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.textInverse}
              />
            }
          />
        </View>

        {/* ADDRESS SELECTION MODAL INLINE OVERLAY */}
        {addressModalType && (
          <View style={styles.addressModalOverlay}>
            <AppCard variant="elevated" padding="lg" style={styles.addressModalCard}>
              <View style={styles.modalHeaderRow}>
                <AppText variant="h2" color="primary">
                  Select {addressModalType === "pickup" ? "Pickup" : "Delivery"} Address
                </AppText>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setAddressModalType(null)}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <AppDivider spacing="sm" />

              <ScrollView style={styles.addressListScroll}>
                {addresses.map((addr) => (
                  <TouchableOpacity
                    key={addr._id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectAddressFromList(addr)}
                    style={styles.modalAddressItem}
                  >
                    <View style={styles.badgeRow}>
                      <AppBadge label={addr.label} variant="primary" size="sm" />
                      {addr.isDefault && (
                        <AppBadge
                          label="DEFAULT"
                          variant="success"
                          size="sm"
                          style={styles.defaultBadge}
                        />
                      )}
                    </View>
                    <AppText variant="bodyBold" color="primary">
                      {addr.fullName} • {addr.phone}
                    </AppText>
                    <AppText variant="body" color="secondary" numberOfLines={2}>
                      {addr.addressLine1}, {addr.city} - {addr.postalCode}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <AppButton
                title="+ Add New Address"
                variant="outline"
                size="md"
                onPress={handleAddNewAddress}
                style={styles.addNewAddressBtn}
              />
            </AppCard>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  addressCard: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  addressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressSectionTitle: {
    marginLeft: spacing.xs,
  },
  changeAddressBtn: {
    padding: spacing.xs,
  },
  addressDetails: {
    marginTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  defaultBadge: {
    marginLeft: spacing.xs,
  },
  nameText: {
    marginBottom: 2,
  },
  selectAddressPrompt: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    justifyContent: "center",
  },
  promptText: {
    marginLeft: spacing.xs,
  },
  sameAddressToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xxs,
    marginBottom: spacing.md,
  },
  sameAddressLabel: {
    marginLeft: spacing.xs,
  },
  scheduleCard: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  scheduleHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleTitle: {
    marginLeft: spacing.xs,
  },
  scheduleSubtitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.sm,
  },
  pillsContainer: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  datePill: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  datePillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  instructionsCard: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  instructionsInput: {
    marginTop: spacing.xs,
  },
  ctaContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  addressModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
    zIndex: 999,
  },
  addressModalCard: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: colors.surface,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressListScroll: {
    maxHeight: 280,
  },
  modalAddressItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addNewAddressBtn: {
    marginTop: spacing.md,
  },
});
