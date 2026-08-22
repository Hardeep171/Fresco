import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { CatalogStackParamList } from "../../types/navigation.types";
import { useCategories } from "../../hooks/useCategories";
import { useGarments } from "../../hooks/useGarments";
import { Category } from "../../types/catalog.types";
import { CategoryCard } from "../../components/catalog";
import {
  AppHeader,
  AppInput,
  AppText,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing } from "../../theme";

type Props = NativeStackScreenProps<CatalogStackParamList, "CatalogScreen">;

export const CatalogScreen: React.FC<Props> = ({ navigation }) => {
  const { categories, isLoading: isCategoriesLoading, error, loadCategories } =
    useCategories();
  const { garments, loadGarments } = useGarments();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories({ isActive: true });
    loadGarments({ isActive: true });
  }, [loadCategories, loadGarments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadCategories({ isActive: true }),
      loadGarments({ isActive: true }),
    ]);
    setRefreshing(false);
  }, [loadCategories, loadGarments]);

  // Garment count map per category
  const garmentCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    garments.forEach((g) => {
      if (g.isActive) {
        map[g.categoryId] = (map[g.categoryId] || 0) + 1;
      }
    });
    return map;
  }, [garments]);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const handleCategoryPress = (category: Category) => {
    navigation.navigate("GarmentListScreen", {
      categoryId: category._id,
      categoryName: category.name,
    });
  };

  return (
    <ScreenContainer
      scrollable
      statusBarStyle="dark"
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
        title="Fabric Care Catalog"
        subtitle="Select a garment category"
        showBack={false}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <AppInput
          placeholder="Search categories (e.g. Men, Women, Bedding)..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={20} color={colors.textSecondary} />}
          rightIcon={
            searchQuery ? (
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            ) : undefined
          }
          onRightIconPress={() => setSearchQuery("")}
          autoCorrect={false}
        />
      </View>

      {/* Main Content */}
      {isCategoriesLoading && !refreshing && categories.length === 0 ? (
        <AppLoader message="Loading categories..." style={styles.loader} />
      ) : error && categories.length === 0 ? (
        <ErrorState
          title="Could Not Load Catalog"
          message={error.message}
          onRetry={() => {
            loadCategories({ isActive: true });
            loadGarments({ isActive: true });
          }}
          style={styles.errorState}
        />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="search-outline" size={48} color={colors.primary} />}
          title="No Categories Found"
          description={
            searchQuery
              ? `No categories matched "${searchQuery}". Try a different keyword.`
              : "No categories are currently available in the catalog."
          }
          actionTitle={searchQuery ? "Clear Search" : undefined}
          onActionPress={searchQuery ? () => setSearchQuery("") : undefined}
          style={styles.emptyState}
        />
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.sectionHeader}>
            <AppText variant="label" color="secondary">
              BROWSE BY CATEGORY ({filteredCategories.length})
            </AppText>
          </View>

          {filteredCategories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onPress={handleCategoryPress}
              garmentCount={garmentCountMap[category._id]}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingTop: spacing.md,
  },
  listContainer: {
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
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
