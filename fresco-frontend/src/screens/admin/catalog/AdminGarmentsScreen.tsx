import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminCatalogStackParamList } from "../../../types/navigation.types";
import { ScreenContainer, AppHeader } from "../../../components/common";
import { AdminGarmentManagement } from "./AdminGarmentManagement";

type Props = NativeStackScreenProps<AdminCatalogStackParamList, "AdminGarmentsScreen">;

export const AdminGarmentsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Manage Garments"
        showBack={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      <AdminGarmentManagement />
    </ScreenContainer>
  );
};
