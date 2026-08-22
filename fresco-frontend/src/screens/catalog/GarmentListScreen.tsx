import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { CatalogStackParamList } from "../../types/navigation.types";
import { useCategories } from "../../hooks/useCategories";
import { useGarments } from "../../hooks/useGarments";
import { usePricing } from "../../hooks/usePricing";
import { Garment, Category } from "../../types/catalog.types";
import { GarmentCard } from "../../components/catalog";
import {
  AppHeader,
  AppInput,
  AppText,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing, radius } from "../../theme";

type Props = NativeStackScreenProps<CatalogStackParamList, "GarmentListScreen">;

export const GarmentListScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { categoryId: initialCategoryId, categoryName: initialCategoryName } =
    route.params;

  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { categories, loadCategories } = useCategories();
  const { garments, isLoading: isGarmentsLoading, error, loadGarments } =
    useGarments();
  const { pricingList, loadPricing } = usePricing();

  const loadDataForCategory = useCallback(
    async (catId: string) => {
      await Promise.all([
        loadGarments({ categoryId: catId, isActive: true }),
        loadPricing({ isActive: true }),
      ]);
    },
    [loadGarments, loadPricing]
  );

  useEffect(() => {
    loadCategories({ isActive: true });
    loadDataForCategory(activeCategoryId);
  }, [activeCategoryId, loadCategories, loadDataForCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadCategories({ isActive: true }),
      loadDataForCategory(activeCategoryId),
    ]);
    setRefreshing(false);
  }, [activeCategoryId, loadCategories, loadDataForCategory]);

  // Compute minimum starting price and service count per garment from pricingList
  const garmentPriceStats = useMemo(() => {
    const minPriceMap: Record<string, number> = {};
    const countMap: Record<string, number> = {};

    pricingList.forEach((p) => {
      if (p.isActive) {
        countMap[p.garmentId] = (countMap[p.garmentId] || 0) + 1;
        const currentMin = minPriceMap[p.garmentId];
        if (currentMin === undefined || p.price < currentMin) {
          minPriceMap[p.garmentId] = p.price;
        }
      }
    });

    return { minPriceMap, countMap };
  }, [pricingList]);

  // Active category object
  const activeCategory = useMemo(() => {
    return (
      categories.find((c) => c._id === activeCategoryId) || {
        _id: activeCategoryId,
        name: initialCategoryName,
      }
    );
  }, [categories, activeCategoryId, initialCategoryName]);

  // Filter garments by active category and search
  const filteredGarments = useMemo(() => {
    const list = garments.filter(
      (g) => g.categoryId === activeCategoryId && g.isActive
    );

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q))
    );
  }, [garments, activeCategoryId, searchQuery]);

  const handleGarmentPress = (garment: Garment) => {
    navigation.navigate("GarmentDetailScreen", {
      garmentId: garment._id,
      garmentName: garment.name,
    });
  };

  const handleCategorySwitch = (category: Category) => {
    setActiveCategoryId(category._id);
    setSearchQuery("");
  };

  const formattedCategoryName =
    activeCategory.name.charAt(0).toUpperCase() + activeCategory.name.slice(1);

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
        title={formattedCategoryName}
        subtitle="Select a garment"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Horizontal Category Selector Pills */}
      {categories.length > 0 && (
        <View style={styles.pillsOuterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScrollContent}
          >
            {categories.map((cat) => {
              const isSelected = cat._id === activeCategoryId;
              const pillName =
                cat.name.charAt(0).toUpperCase() + cat.name.slice(1);

              return (
                <TouchableOpacity
                  key={cat._id}
                  activeOpacity={0.7}
                  onPress={() => handleCategorySwitch(cat)}
                  style={[
                    styles.categoryPill,
                    isSelected && styles.categoryPillSelected,
                  ]}
                  accessibilityRole="tab"
                  accessibilityLabel={`Switch to ${pillName} category`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <AppText
                    variant="captionMedium"
                    color={isSelected ? "inverse" : "secondary"}
                  >
                    {pillName}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <AppInput
          placeholder={`Search ${formattedCategoryName.toLowerCase()}...`}
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

      {/* Garments List Content */}
      {isGarmentsLoading && !refreshing && garments.length === 0 ? (
        <AppLoader message="Loading garments..." style={styles.loader} />
      ) : error && garments.length === 0 ? (
        <ErrorState
          title="Could Not Load Garments"
          message={error.message}
          onRetry={() => loadDataForCategory(activeCategoryId)}
          style={styles.errorState}
        />
      ) : filteredGarments.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="shirt-outline" size={48} color={colors.primary} />}
          title="No Garments Found"
          description={
            searchQuery
              ? `No garments matched "${searchQuery}" in ${formattedCategoryName}.`
              : `No garments are currently listed under ${formattedCategoryName}.`
          }
          actionTitle={searchQuery ? "Clear Search" : "Back to Catalog"}
          onActionPress={
            searchQuery ? () => setSearchQuery("") : () => navigation.goBack()
          }
          style={styles.emptyState}
        />
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.sectionHeader}>
            <AppText variant="label" color="secondary">
              AVAILABLE GARMENTS ({filteredGarments.length})
            </AppText>
          </View>

          {filteredGarments.map((garment) => (
            <GarmentCard
              key={garment._id}
              garment={garment}
              onPress={handleGarmentPress}
              minPrice={garmentPriceStats.minPriceMap[garment._id]}
              serviceCount={garmentPriceStats.countMap[garment._id]}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  pillsOuterContainer: {
    paddingVertical: spacing.sm,
  },
  pillsScrollContent: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xxs,
  },
  categoryPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  searchContainer: {
    paddingTop: spacing.xs,
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
