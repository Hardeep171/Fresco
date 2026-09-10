import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminCatalogStackParamList } from "../../../types/navigation.types";
import { ScreenContainer, AppHeader } from "../../../components/common";
import { AdminPricingManagement } from "./AdminPricingManagement";

type Props = NativeStackScreenProps<AdminCatalogStackParamList, "AdminPricingScreen">;

export const AdminPricingScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Pricing Matrix"
        showBack={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      <AdminPricingManagement />
    </ScreenContainer>
  );
};
