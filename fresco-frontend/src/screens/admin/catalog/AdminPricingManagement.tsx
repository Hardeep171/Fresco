import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePricing } from "../../../hooks/usePricing";
import { useGarments } from "../../../hooks/useGarments";
import { useServices } from "../../../hooks/useServices";
import { useCategories } from "../../../hooks/useCategories";
import {
  Pricing,
  Garment,
  Service,
  CreatePricingInput,
  UpdatePricingInput,
} from "../../../types/catalog.types";
import {
  AppText,
  AppCard,
  AppBadge,
  AppButton,
  AppInput,
  AppLoader,
  EmptyState,
} from "../../../components/common";
import { useTheme, spacing, radius } from "../../../theme";
import { formatCurrency } from "../../../utils/formatters";

export const AdminPricingManagement: React.FC = () => {
  const { colors } = useTheme();
  const {
    pricingList,
    isLoading: isPricingLoading,
    isMutating,
    mutationError,
    loadAllPricingAdmin,
    createPricing,
    updatePricing,
    enablePricing,
    disablePricing,
    clearMutation,
  } = usePricing();

  const { garments, loadAllGarmentsAdmin, isLoading: isGarmentsLoading } = useGarments();
  const { services, loadAllServicesAdmin, isLoading: isServicesLoading } = useServices();
  const { categories, loadAllCategoriesAdmin } = useCategories();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPricing, setEditingPricing] = useState<Pricing | null>(null);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [formError, setFormError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadAllPricingAdmin(),
      loadAllGarmentsAdmin(),
      loadAllServicesAdmin(),
      loadAllCategoriesAdmin(),
    ]);
  }, [loadAllPricingAdmin, loadAllGarmentsAdmin, loadAllServicesAdmin, loadAllCategoriesAdmin]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  // Pricing matrix lookup map: key = `${garmentId}_${serviceId}`
  const pricingMatrix = useMemo(() => {
    const map = new Map<string, Pricing>();
    pricingList.forEach((p) => {
      map.set(`${p.garmentId}_${p.serviceId}`, p);
    });
    return map;
  }, [pricingList]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c._id, c.name));
    return map;
  }, [categories]);

  const garmentMap = useMemo(() => {
    const map = new Map<string, Garment>();
    garments.forEach((g) => map.set(g._id, g));
    return map;
  }, [garments]);

  const serviceMap = useMemo(() => {
    const map = new Map<string, Service>();
    services.forEach((s) => map.set(s._id, s));
    return map;
  }, [services]);

  // Open modal for creating a new or specific pair
  const openCreateModal = (prefillGarmentId?: string, prefillServiceId?: string) => {
    setEditingPricing(null);
    setSelectedGarmentId(prefillGarmentId || (garments[0]?._id ?? ""));
    setSelectedServiceId(prefillServiceId || (services[0]?._id ?? ""));
    setPrice("");
    setCurrency("INR");
    setFormError(null);
    clearMutation();
    setModalVisible(true);
  };

  // Open modal for editing existing pricing
  const openEditModal = (p: Pricing) => {
    setEditingPricing(p);
    setSelectedGarmentId(p.garmentId);
    setSelectedServiceId(p.serviceId);
    setPrice(p.price.toString());
    setCurrency(p.currency || "INR");
    setFormError(null);
    clearMutation();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPricing(null);
    setFormError(null);
    clearMutation();
  };

  const handleSave = async () => {
    if (!selectedGarmentId) {
      setFormError("Please select a garment.");
      return;
    }
    if (!selectedServiceId) {
      setFormError("Please select a service.");
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Price must be a valid non-negative number.");
      return;
    }

    setFormError(null);

    if (editingPricing) {
      const updateData: UpdatePricingInput = {
        price: priceNum,
        currency: currency.trim() || "INR",
      };
      const success = await updatePricing(editingPricing._id, updateData);
      if (success) {
        closeModal();
      }
    } else {
      // Check if price already exists for this pair
      const existing = pricingMatrix.get(`${selectedGarmentId}_${selectedServiceId}`);
      if (existing) {
        setFormError("A pricing entry already exists for this garment and service combination.");
        return;
      }

      const createData: CreatePricingInput = {
        garmentId: selectedGarmentId,
        serviceId: selectedServiceId,
        price: priceNum,
        currency: currency.trim() || "INR",
        isActive: true,
      };
      const success = await createPricing(createData);
      if (success) {
        closeModal();
      }
    }
  };

  const handleToggleStatus = (p: Pricing) => {
    const action = p.isActive ? "Disable" : "Enable";
    const garment = garmentMap.get(p.garmentId);
    const service = serviceMap.get(p.serviceId);
    const label = `${garment?.name || "Garment"} × ${service?.name || "Service"}`;
    const confirmMessage = p.isActive
      ? `Are you sure you want to disable pricing for ${label}? Customer orders will not be allowed for this combination.`
      : `Are you sure you want to enable pricing for ${label}?`;

    if (Platform.OS === "web") {
      if (window.confirm(confirmMessage)) {
        if (p.isActive) {
          disablePricing(p._id);
        } else {
          enablePricing(p._id);
        }
      }
    } else {
      Alert.alert(`${action} Pricing`, confirmMessage, [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: p.isActive ? "destructive" : "default",
          onPress: () => {
            if (p.isActive) {
              disablePricing(p._id);
            } else {
              enablePricing(p._id);
            }
          },
        },
      ]);
    }
  };

  const filteredGarments = useMemo(() => {
    return garments
      .filter((g) => {
        if (selectedCategoryId && g.categoryId !== selectedCategoryId) return false;
        return true;
      })
      .filter((g) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const catName = (categoryMap.get(g.categoryId) || "").toLowerCase();
        return g.name.toLowerCase().includes(q) || catName.includes(q);
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [garments, selectedCategoryId, searchQuery, categoryMap]);

  const isLoading = (isPricingLoading || isGarmentsLoading || isServicesLoading) && !refreshing && garments.length === 0;

  return (
    <View style={styles.container}>
      {/* Category Filter Chips */}
      <View style={styles.categoryFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipRow}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategoryId === null && { backgroundColor: colors.primary },
            ]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <AppText
              variant="caption"
              color={selectedCategoryId === null ? "inverse" : "secondary"}
            >
              All Categories
            </AppText>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c._id}
              style={[
                styles.categoryChip,
                selectedCategoryId === c._id && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSelectedCategoryId(c._id)}
            >
              <AppText
                variant="caption"
                color={selectedCategoryId === c._id ? "inverse" : "secondary"}
              >
                {c.name.toUpperCase()}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Action bar: Add pair & search */}
      <View style={styles.actionBar}>
        <AppInput
          placeholder="Filter garments by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={18} color={colors.textSecondary} />}
          style={styles.searchBar}
        />
        <AppButton
          title="+ Add Price"
          size="sm"
          onPress={() => openCreateModal()}
          style={styles.addButton}
        />
      </View>

      {isLoading ? (
        <View style={styles.loaderCenter}>
          <AppLoader variant="spinner" size="large" message="Loading pricing matrix..." />
        </View>
      ) : filteredGarments.length === 0 ? (
        <EmptyState
          title="No Garments Found"
          description="No garments available to show in pricing matrix."
          icon={<Ionicons name="pricetags-outline" size={48} color={colors.primary} />}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {filteredGarments.map((garment) => {
            const catName = categoryMap.get(garment.categoryId) || "Unassigned";
            return (
              <AppCard key={garment._id} style={styles.garmentCard} variant="elevated">
                {/* Garment Header */}
                <View style={styles.garmentHeader}>
                  <View style={styles.garmentHeaderInfo}>
                    <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceMuted }]}>
                      <Ionicons
                        name={(garment.icon as any) || "shirt-outline"}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View>
                      <View style={styles.titleRow}>
                        <AppText variant="h3">
                          {garment.name.toUpperCase()}
                        </AppText>
                        {!garment.isActive && (
                          <AppBadge label="GARMENT INACTIVE" variant="neutral" size="sm" />
                        )}
                      </View>
                      <AppText variant="caption" color="secondary">
                        Category: {catName.toUpperCase()}
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* Service Pricing Grid */}
                <View style={styles.servicePricingContainer}>
                  {services.map((service) => {
                    const pricingEntry = pricingMatrix.get(`${garment._id}_${service._id}`);
                    return (
                      <View
                        key={service._id}
                        style={[
                          styles.serviceRow,
                          {
                            backgroundColor: colors.surfaceMuted,
                            borderColor: pricingEntry?.isActive
                              ? "rgba(16, 185, 129, 0.3)"
                              : "rgba(148, 163, 184, 0.2)",
                          },
                        ]}
                      >
                        <View style={styles.serviceRowLeft}>
                          <View style={styles.serviceNameRow}>
                            <AppText variant="bodyBold">
                              {service.name}
                            </AppText>
                            {!service.isActive && (
                              <AppBadge label="SVC INACTIVE" variant="neutral" size="sm" />
                            )}
                          </View>

                          {pricingEntry ? (
                            <View style={styles.priceDisplayRow}>
                              <AppText
                                variant="h3"
                                color={pricingEntry.isActive ? "brand" : "secondary"}
                              >
                                {formatCurrency(pricingEntry.price)}
                              </AppText>
                              <AppBadge
                                label={pricingEntry.isActive ? "ACTIVE" : "DISABLED"}
                                variant={pricingEntry.isActive ? "success" : "neutral"}
                                size="sm"
                              />
                            </View>
                          ) : (
                            <AppBadge label="NOT CONFIGURED" variant="warning" size="sm" />
                          )}
                        </View>

                        {/* Action buttons */}
                        <View style={styles.serviceRowRight}>
                          {pricingEntry ? (
                            <>
                              <AppButton
                                title="Edit"
                                variant="outline"
                                size="sm"
                                onPress={() => openEditModal(pricingEntry)}
                                style={styles.miniBtn}
                              />
                              <AppButton
                                title={pricingEntry.isActive ? "Disable" : "Enable"}
                                variant={pricingEntry.isActive ? "danger" : "secondary"}
                                size="sm"
                                onPress={() => handleToggleStatus(pricingEntry)}
                                style={styles.miniBtn}
                              />
                            </>
                          ) : (
                            <AppButton
                              title="+ Set Price"
                              variant="primary"
                              size="sm"
                              onPress={() => openCreateModal(garment._id, service._id)}
                              style={styles.setPriceBtn}
                            />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </AppCard>
            );
          })}
        </ScrollView>
      )}

      {/* Create / Edit Pricing Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <AppText variant="h2">
                {editingPricing ? "Edit Pricing" : "Set Garment × Service Price"}
              </AppText>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {formError ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.errorSurface }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <AppText variant="caption" color="error" style={styles.errorText}>
                    {formError}
                  </AppText>
                </View>
              ) : null}

              {mutationError ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.errorSurface }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <AppText variant="caption" color="error" style={styles.errorText}>
                    {mutationError.message}
                  </AppText>
                </View>
              ) : null}

              {/* Garment Selector */}
              <View style={styles.pickerSection}>
                <AppText variant="label">
                  Garment *
                </AppText>
                {editingPricing ? (
                  <AppCard variant="flat" style={styles.selectedPairCard}>
                    <AppText variant="bodyBold">
                      {garmentMap.get(selectedGarmentId)?.name.toUpperCase() || selectedGarmentId}
                    </AppText>
                  </AppCard>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.selectorRow}
                  >
                    {garments.map((g) => {
                      const isSelected = selectedGarmentId === g._id;
                      return (
                        <TouchableOpacity
                          key={g._id}
                          style={[
                            styles.selectorChip,
                            isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                          ]}
                          onPress={() => setSelectedGarmentId(g._id)}
                        >
                          <AppText
                            variant="caption"
                            color={isSelected ? "inverse" : "secondary"}
                          >
                            {g.name.toUpperCase()} {!g.isActive ? "(Inactive)" : ""}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Service Selector */}
              <View style={styles.pickerSection}>
                <AppText variant="label">
                  Service *
                </AppText>
                {editingPricing ? (
                  <AppCard variant="flat" style={styles.selectedPairCard}>
                    <AppText variant="bodyBold">
                      {serviceMap.get(selectedServiceId)?.name || selectedServiceId}
                    </AppText>
                  </AppCard>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.selectorRow}
                  >
                    {services.map((s) => {
                      const isSelected = selectedServiceId === s._id;
                      return (
                        <TouchableOpacity
                          key={s._id}
                          style={[
                            styles.selectorChip,
                            isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                          ]}
                          onPress={() => setSelectedServiceId(s._id)}
                        >
                          <AppText
                            variant="caption"
                            color={isSelected ? "inverse" : "secondary"}
                          >
                            {s.name} {!s.isActive ? "(Inactive)" : ""}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              <AppInput
                label="Price (₹) *"
                placeholder="e.g. 50"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />

              <AppInput
                label="Currency"
                placeholder="INR"
                value={currency}
                onChangeText={setCurrency}
                autoCapitalize="characters"
              />

              <View style={styles.modalFooter}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={closeModal}
                  style={styles.modalBtn}
                  disabled={isMutating}
                />
                <AppButton
                  title={editingPricing ? "Save Changes" : "Create Price Pair"}
                  variant="primary"
                  onPress={handleSave}
                  loading={isMutating}
                  style={styles.modalBtn}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryFilterContainer: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.15)",
  },
  categoryChipRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
  },
  addButton: {
    width: "auto",
    paddingHorizontal: spacing.md,
  },
  loaderCenter: {
    padding: spacing.xl,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  garmentCard: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
  garmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.15)",
    paddingBottom: spacing.xs,
  },
  garmentHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  servicePricingContainer: {
    gap: spacing.xs,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  serviceRowLeft: {
    flex: 1,
    gap: 2,
  },
  serviceNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  priceDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  serviceRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  miniBtn: {
    width: "auto",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  setPriceBtn: {
    width: "auto",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "90%",
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.15)",
  },
  closeBtn: {
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pickerSection: {
    gap: spacing.xs,
  },
  selectorRow: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  selectorChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
  },
  selectedPairCard: {
    padding: spacing.sm,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  errorText: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalBtn: {
    flex: 1,
  },
});
