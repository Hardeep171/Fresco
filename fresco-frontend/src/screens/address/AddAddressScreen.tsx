import React, { useEffect } from "react";
import { Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../types/navigation.types";
import { useAddress } from "../../hooks/useAddress";
import { useUser } from "../../hooks/useUser";
import { CreateAddressInput } from "../../types/address.types";
import { AddressForm } from "../../components/address";
import { AppHeader, ScreenContainer } from "../../components/common";

type Props = NativeStackScreenProps<ProfileStackParamList, "AddAddressScreen">;

export const AddAddressScreen: React.FC<Props> = ({ navigation }) => {
  const { profile } = useUser();
  const {
    addAddress,
    isCreating,
    actionError,
    clearErrors,
    resetSuccess,
  } = useAddress();

  useEffect(() => {
    return () => {
      clearErrors();
      resetSuccess();
    };
  }, [clearErrors, resetSuccess]);

  const handleSubmit = async (values: CreateAddressInput) => {
    clearErrors();
    const success = await addAddress(values);

    if (success) {
      Alert.alert(
        "Address Added",
        "Your new delivery address has been saved successfully.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  const defaultFullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "";

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Add New Address"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <AddressForm
        initialValues={{
          label: "HOME",
          fullName: defaultFullName,
          phone: profile?.phone || "",
          country: "India",
          isDefault: false,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
        submitTitle="Save Address"
        serverError={actionError}
        onCancel={() => navigation.goBack()}
      />
    </ScreenContainer>
  );
};
