import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ProfileStackParamList } from "../../types/navigation.types";
import { useAddress } from "../../hooks/useAddress";
import { Address } from "../../types/address.types";
import {
  AppText,
  AppCard,
  AppBadge,
  AppHeader,
  AppIconButton,
  AppDivider,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import { useTheme, colors, spacing, shadows } from "../../theme";

type Props = NativeStackScreenProps<
  ProfileStackParamList,
  "AddressListScreen"
>;

export const AddressListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    addresses,
    isLoading,
    isDeleting,
    deletingAddressId,
    isSettingDefault,
    settingDefaultAddressId,
    error,
    loadAddresses,
    removeAddress,
    makeDefault,
  } = useAddress();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  }, [loadAddresses]);

  const handleDelete = (address: Address) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to delete this ${address.label.toLowerCase()} address?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await removeAddress(address._id);
            if (!success) {
              Alert.alert("Error", "Failed to delete address. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    const success = await makeDefault(addressId);
    if (!success) {
      Alert.alert("Error", "Failed to set default address. Please try again.");
    }
  };

  const renderAddressCard = (address: Address) => {
    const isThisDeleting =
      isDeleting && deletingAddressId === address._id;
    const isThisSettingDefault =
      isSettingDefault && settingDefaultAddressId === address._id;

    return (
      <AppCard
        key={address._id}
        variant="elevated"
        padding="md"
        style={{
          ...styles.addressCard,
          ...(address.isDefault ? styles.defaultAddressCard : {}),
        }}
      >
        {/* Card Header: Label & Default Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.badgeGroup}>
            <AppBadge
              label={address.label}
              variant={address.label === "HOME" ? "primary" : "secondary"}
              size="sm"
            />
            {address.isDefault && (
              <AppBadge
                label="DEFAULT"
                variant="success"
                size="sm"
                showDot
                style={styles.defaultBadge}
              />
            )}
          </View>

          {/* Action Buttons: Edit & Delete */}
          <View style={styles.cardHeaderActions}>
            <AppIconButton
              icon={
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.primary}
                />
              }
              onPress={() =>
                navigation.navigate("EditAddressScreen", {
                  addressId: address._id,
                })
              }
              size="sm"
              accessibilityLabel={`Edit ${address.label} address`}
            />

            {isThisDeleting ? (
              <View style={styles.actionSpinnerWrapper}>
                <ActivityIndicator size="small" color={colors.error} />
              </View>
            ) : (
              <AppIconButton
                icon={
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.error}
                  />
                }
                onPress={() => handleDelete(address)}
                size="sm"
                accessibilityLabel={`Delete ${address.label} address`}
              />
            )}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactRow}>
          <AppText variant="bodyBold" color="primary">
            {address.fullName}
          </AppText>
          <AppText variant="caption" color="secondary" style={styles.phoneText}>
            • {address.phone}
          </AppText>
        </View>

        {/* Address Lines */}
        <View style={styles.addressBody}>
          <AppText variant="body" color="secondary">
            {address.addressLine1}
          </AppText>
          {address.addressLine2 ? (
            <AppText variant="body" color="secondary">
              {address.addressLine2}
            </AppText>
          ) : null}
          {address.landmark ? (
            <AppText variant="caption" color="muted" style={styles.landmarkText}>
              Landmark: {address.landmark}
            </AppText>
          ) : null}
          <AppText variant="bodyMedium" color="primary" style={styles.locationText}>
            {address.city}, {address.state} - {address.postalCode}
          </AppText>
          <AppText variant="caption" color="secondary">
            {address.country}
          </AppText>
        </View>

        {/* Set Default Action */}
        {!address.isDefault && (
          <>
            <AppDivider spacing="sm" />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleSetDefault(address._id)}
              disabled={isThisSettingDefault}
              style={styles.setDefaultButton}
              accessibilityRole="button"
              accessibilityLabel="Set as default address"
            >
              {isThisSettingDefault ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View style={styles.setDefaultContent}>
                  <Ionicons
                    name="radio-button-off"
                    size={18}
                    color={colors.primary}
                    style={styles.radioIcon}
                  />
                  <AppText variant="captionMedium" color="brand">
                    Set as Default Address
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </AppCard>
    );
  };

  return (
    <ScreenContainer
      scrollable
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
        title="Saved Addresses"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <AppIconButton
            icon={<Ionicons name="add" size={24} color={colors.primary} />}
            onPress={() => navigation.navigate("AddAddressScreen")}
            size="sm"
            accessibilityLabel="Add New Address"
          />
        }
      />

      {isLoading && !refreshing && addresses.length === 0 ? (
        <AppLoader message="Loading saved addresses..." style={styles.loader} />
      ) : error && addresses.length === 0 ? (
        <ErrorState
          title="Could Not Load Addresses"
          message={error.message}
          onRetry={loadAddresses}
          style={styles.errorState}
        />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={
            <Ionicons
              name="location-outline"
              size={48}
              color={colors.primary}
            />
          }
          title="No Addresses Saved"
          description="Add your home or office address to make laundry pickup and delivery quick and effortless."
          actionTitle="Add New Address"
          onActionPress={() => navigation.navigate("AddAddressScreen")}
          style={styles.emptyState}
        />
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.headerInfoRow}>
            <AppText variant="captionMedium" color="secondary">
              {addresses.length === 1
                ? "1 address on file"
                : `${addresses.length} addresses on file`}
            </AppText>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AddAddressScreen")}
              accessibilityRole="button"
            >
              <AppText variant="captionMedium" color="brand">
                + Add Address
              </AppText>
            </TouchableOpacity>
          </View>

          {addresses.map(renderAddressCard)}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  headerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xxs,
  },
  addressCard: {
    marginBottom: spacing.md,
    ...shadows.card,
  },
  defaultAddressCard: {
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultBadge: {
    marginLeft: spacing.xs,
  },
  cardHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionSpinnerWrapper: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  phoneText: {
    marginLeft: spacing.xs,
  },
  addressBody: {
    marginVertical: spacing.xs,
  },
  landmarkText: {
    marginTop: spacing.xxs,
  },
  locationText: {
    marginTop: spacing.xs,
  },
  setDefaultButton: {
    paddingVertical: spacing.xs,
    alignItems: "flex-start",
  },
  setDefaultContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioIcon: {
    marginRight: spacing.xs,
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
