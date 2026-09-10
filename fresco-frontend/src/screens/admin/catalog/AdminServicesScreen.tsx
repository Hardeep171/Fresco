import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminCatalogStackParamList } from "../../../types/navigation.types";
import { ScreenContainer, AppHeader } from "../../../components/common";
import { AdminServiceManagement } from "./AdminServiceManagement";

type Props = NativeStackScreenProps<AdminCatalogStackParamList, "AdminServicesScreen">;

export const AdminServicesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Manage Services"
        showBack={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      <AdminServiceManagement />
    </ScreenContainer>
  );
};
