import React, { useEffect, useMemo } from "react";
import { StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../types/navigation.types";
import { useAddress } from "../../hooks/useAddress";
import { CreateAddressInput } from "../../types/address.types";
import { AddressForm } from "../../components/address";
import {
  AppHeader,
  AppLoader,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import { spacing } from "../../theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "EditAddressScreen">;

export const EditAddressScreen: React.FC<Props> = ({ route, navigation }) => {
  const { addressId } = route.params;
  const {
    addresses,
    selectedAddress,
    isFetchingById,
    isUpdating,
    actionError,
    loadAddressById,
    editAddress,
    clearErrors,
    resetSuccess,
  } = useAddress();

  // Find address from existing list or selectedAddress
  const targetAddress = useMemo(() => {
    return (
      addresses.find((a) => a._id === addressId) ||
      (selectedAddress?._id === addressId ? selectedAddress : null)
    );
  }, [addresses, selectedAddress, addressId]);

  useEffect(() => {
    if (!targetAddress && addressId) {
      loadAddressById(addressId);
    }
  }, [targetAddress, addressId, loadAddressById]);

  useEffect(() => {
    return () => {
      clearErrors();
      resetSuccess();
    };
  }, [clearErrors, resetSuccess]);

  const handleSubmit = async (values: CreateAddressInput) => {
    clearErrors();
    const success = await editAddress(addressId, values);

    if (success) {
      Alert.alert(
        "Address Updated",
        "Your delivery address has been updated successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <ScreenContainer scrollable statusBarStyle="dark">
      <AppHeader
        title="Edit Address"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {isFetchingById && !targetAddress ? (
        <AppLoader message="Loading address details..." style={styles.loader} />
      ) : !targetAddress ? (
        <ErrorState
          title="Address Not Found"
          message="The requested address could not be found or has been removed."
          onRetry={() => loadAddressById(addressId)}
          retryText="Reload Address"
          style={styles.errorState}
        />
      ) : (
        <AddressForm
          initialValues={{
            label: targetAddress.label,
            fullName: targetAddress.fullName,
            phone: targetAddress.phone,
            addressLine1: targetAddress.addressLine1,
            addressLine2: targetAddress.addressLine2 || "",
            landmark: targetAddress.landmark || "",
            city: targetAddress.city,
            state: targetAddress.state,
            postalCode: targetAddress.postalCode,
            country: targetAddress.country || "India",
            isDefault: targetAddress.isDefault,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
          submitTitle="Update Address"
          serverError={actionError}
          onCancel={() => navigation.goBack()}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xxxl,
  },
  errorState: {
    marginTop: spacing.xxl,
  },
});
