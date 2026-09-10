import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminCatalogStackParamList, AdminCatalogTabType } from "../../../types/navigation.types";
import { ScreenContainer, AppHeader, AppText } from "../../../components/common";
import { useTheme, spacing } from "../../../theme";
import { AdminCategoryManagement } from "./AdminCategoryManagement";
import { AdminGarmentManagement } from "./AdminGarmentManagement";
import { AdminServiceManagement } from "./AdminServiceManagement";
import { AdminPricingManagement } from "./AdminPricingManagement";

type Props = NativeStackScreenProps<AdminCatalogStackParamList, "AdminCatalogScreen">;

interface TabConfig {
  key: AdminCatalogTabType;
  title: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { key: "categories", title: "Categories", icon: "file-tray-stacked-outline" },
  { key: "garments", title: "Garments", icon: "shirt-outline" },
  { key: "services", title: "Services", icon: "water-outline" },
  { key: "pricing", title: "Pricing Matrix", icon: "pricetags-outline" },
];

export const AdminCatalogScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const initialTab = route.params?.initialTab || "categories";
  const [activeTab, setActiveTab] = useState<AdminCatalogTabType>(initialTab);

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Catalog Operations"
        showBack={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />

      {/* Segmented Top Navigation Tabs */}
      <View style={[styles.tabBarContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  isActive && [styles.activeTabButton, { borderBottomColor: colors.primary }],
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <AppText
                  variant={isActive ? "bodyBold" : "bodyMedium"}
                  color={isActive ? "brand" : "secondary"}
                >
                  {tab.title}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === "categories" && <AdminCategoryManagement />}
        {activeTab === "garments" && <AdminGarmentManagement />}
        {activeTab === "services" && <AdminServiceManagement />}
        {activeTab === "pricing" && <AdminPricingManagement />}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    borderBottomWidth: 1,
  },
  tabScroll: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
  },
  tabButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabContent: {
    flex: 1,
  },
});
