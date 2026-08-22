import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { CatalogStackParamList } from "../../types/navigation.types";
import { useGarments } from "../../hooks/useGarments";
import { useCategories } from "../../hooks/useCategories";
import { useServices } from "../../hooks/useServices";
import { usePricing } from "../../hooks/usePricing";
import { useCart } from "../../hooks/useCart";
import { ServiceOptionWithPrice } from "../../types/catalog.types";
import {
  ServiceOptionCard,
  QuantityStepper,
  PriceSummaryCard,
} from "../../components/catalog";
import {
  AppHeader,
  AppText,
  AppButton,
  AppCard,
  AppBadge,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import { colors, spacing, radius, shadows } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

type Props = NativeStackScreenProps<
  CatalogStackParamList,
  "GarmentDetailScreen"
>;

export const GarmentDetailScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { garmentId, garmentName } = route.params;

  const {
    garments,
    selectedGarment,
    isLoading: isGarmentLoading,
    error: garmentError,
    loadGarmentById,
  } = useGarments();

  const { categories, loadCategories } = useCategories();
  const {
    services,
    isLoading: isServicesLoading,
    error: servicesError,
    loadServices,
  } = useServices();

  const {
    pricingList,
    isLoading: isPricingLoading,
    error: pricingError,
    loadPricing,
  } = usePricing();

  const { addItem, isAddingItem } = useCart();

  const [selectedOption, setSelectedOption] =
    useState<ServiceOptionWithPrice | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Identify the target garment
  const garment = useMemo(() => {
    return (
      garments.find((g) => g._id === garmentId) ||
      (selectedGarment?._id === garmentId ? selectedGarment : null)
    );
  }, [garments, selectedGarment, garmentId]);

  // Identify parent category
  const category = useMemo(() => {
    if (!garment) return null;
    return categories.find((c) => c._id === garment.categoryId);
  }, [categories, garment]);

  // Load all necessary data
  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadGarmentById(garmentId),
      loadServices({ isActive: true }),
      loadPricing({ garmentId, isActive: true }),
      loadCategories({ isActive: true }),
    ]);
  }, [garmentId, loadGarmentById, loadServices, loadPricing, loadCategories]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  // Combine services with authoritative backend pricing for this garment
  const availableServiceOptions = useMemo((): ServiceOptionWithPrice[] => {
    const garmentPricing = pricingList.filter(
      (p) => p.garmentId === garmentId && p.isActive
    );

    const options: ServiceOptionWithPrice[] = [];
    for (const pricing of garmentPricing) {
      const matchedService = services.find(
        (s) => s._id === pricing.serviceId && s.isActive
      );
      if (matchedService) {
        options.push({ service: matchedService, pricing });
      }
    }

    return options.sort(
      (a, b) => (a.service.displayOrder || 0) - (b.service.displayOrder || 0)
    );
  }, [pricingList, services, garmentId]);

  // Automatically select the first available service if none selected
  useEffect(() => {
    if (!selectedOption && availableServiceOptions.length > 0 && availableServiceOptions[0]) {
      setSelectedOption(availableServiceOptions[0]);
    }
  }, [availableServiceOptions, selectedOption]);

  const handleAddToCart = async () => {
    if (!selectedOption || !garment) return;

    const success = await addItem({
      garmentId: garment._id,
      serviceId: selectedOption.service._id,
      quantity,
    });

    if (success) {
      const formattedName =
        garment.name.charAt(0).toUpperCase() + garment.name.slice(1);
      const formattedServiceName =
        selectedOption.service.name.charAt(0).toUpperCase() +
        selectedOption.service.name.slice(1);

      Alert.alert(
        "Added to Cart",
        `Added ${quantity} × ${formattedName} (${formattedServiceName}) to your cart.`,
        [
          {
            text: "Continue Shopping",
            onPress: () => navigation.goBack(),
            style: "cancel",
          },
          {
            text: "View Cart",
            onPress: () => {
              // Switch to Cart Tab if mounted in tab navigator, or go back
              (navigation.getParent() as any)?.navigate("CartTab");
            },
          },
        ]
      );
    }
  };

  const isLoading =
    (isGarmentLoading || isServicesLoading || isPricingLoading) && !refreshing;
  const error = garmentError || servicesError || pricingError;

  const formattedGarmentName = garment
    ? garment.name.charAt(0).toUpperCase() + garment.name.slice(1)
    : garmentName;

  const formattedCategoryName = category
    ? category.name.charAt(0).toUpperCase() + category.name.slice(1)
    : "Category";

  const renderContent = () => {
    if (isLoading && !garment) {
      return <AppLoader message="Loading garment details..." style={styles.loader} />;
    }

    if (error && !garment) {
      return (
        <ErrorState
          title="Could Not Load Garment"
          message={error.message}
          onRetry={loadAllData}
          style={styles.errorState}
        />
      );
    }

    if (!garment) {
      return (
        <EmptyState
          icon={<Ionicons name="alert-circle-outline" size={48} color={colors.error} />}
          title="Garment Not Found"
          description="The requested garment could not be found or has been disabled."
          actionTitle="Back to Catalog"
          onActionPress={() => navigation.goBack()}
          style={styles.emptyState}
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {/* Garment Hero Card */}
        <AppCard variant="elevated" padding="lg" style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="shirt-outline" size={36} color={colors.primary} />
            </View>
            <View style={styles.heroTextContainer}>
              <AppBadge
                label={formattedCategoryName}
                variant="primary"
                size="sm"
                style={styles.categoryBadge}
              />
              <AppText variant="h1" color="primary" style={styles.heroTitle}>
                {formattedGarmentName}
              </AppText>
              {garment.description ? (
                <AppText variant="body" color="secondary">
                  {garment.description}
                </AppText>
              ) : null}
            </View>
          </View>
        </AppCard>

        {/* Service Selection Section */}
        <View style={styles.sectionHeader}>
          <AppText variant="label" color="secondary">
            CHOOSE FABRIC CARE SERVICE ({availableServiceOptions.length})
          </AppText>
        </View>

        {availableServiceOptions.length === 0 ? (
          <AppCard variant="outlined" padding="md" style={styles.noServiceCard}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.warning}
              style={styles.infoIcon}
            />
            <AppText variant="body" color="secondary" style={styles.noServiceText}>
              No specific services are currently configured for this garment.
            </AppText>
          </AppCard>
        ) : (
          availableServiceOptions.map((opt) => (
            <ServiceOptionCard
              key={opt.pricing._id}
              option={opt}
              isSelected={selectedOption?.pricing._id === opt.pricing._id}
              onSelect={(selected) => setSelectedOption(selected)}
            />
          ))
        )}

        {/* Quantity Stepper Section */}
        {selectedOption && (
          <>
            <AppCard variant="outlined" padding="md" style={styles.quantityCard}>
              <View style={styles.quantityRow}>
                <View style={styles.quantityTextContainer}>
                  <AppText variant="bodyBold" color="primary">
                    Select Quantity
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Number of {formattedGarmentName.toLowerCase()}s for care
                  </AppText>
                </View>
                <QuantityStepper
                  quantity={quantity}
                  onIncrement={() => setQuantity((q) => q + 1)}
                  onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
                />
              </View>
            </AppCard>

            {/* Authoritative Price Summary Card */}
            <PriceSummaryCard
              unitPrice={selectedOption.pricing.price}
              quantity={quantity}
              serviceName={selectedOption.service.name}
            />

            {/* Add To Cart CTA Button */}
            <View style={styles.ctaContainer}>
              <AppButton
                title={`Add to Cart • ${formatCurrency(
                  selectedOption.pricing.price * quantity
                )}`}
                variant="primary"
                size="lg"
                loading={isAddingItem}
                onPress={handleAddToCart}
                leftIcon={<Ionicons name="cart-outline" size={22} color={colors.textInverse} />}
              />
            </View>
          </>
        )}
      </View>
    );
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
        title={formattedGarmentName}
        subtitle="Fabric Care & Pricing"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {renderContent()}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  heroTextContainer: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    marginBottom: spacing.xs,
  },
  heroTitle: {
    marginBottom: spacing.xxs,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  noServiceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningSurface,
    borderColor: colors.warning,
    marginBottom: spacing.md,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  noServiceText: {
    flex: 1,
  },
  quantityCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  ctaContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
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
