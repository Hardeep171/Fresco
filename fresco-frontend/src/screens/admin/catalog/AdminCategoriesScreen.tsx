import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminCatalogStackParamList } from "../../../types/navigation.types";
import { ScreenContainer, AppHeader } from "../../../components/common";
import { AdminCategoryManagement } from "./AdminCategoryManagement";

type Props = NativeStackScreenProps<AdminCatalogStackParamList, "AdminCategoriesScreen">;

export const AdminCategoriesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Manage Categories"
        showBack={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      <AdminCategoryManagement />
    </ScreenContainer>
  );
};
