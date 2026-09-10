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
import { useGarments } from "../../../hooks/useGarments";
import { useCategories } from "../../../hooks/useCategories";
import { Garment, CreateGarmentInput, UpdateGarmentInput } from "../../../types/catalog.types";
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

export const AdminGarmentManagement: React.FC = () => {
  const { colors } = useTheme();
  const {
    garments,
    isLoading,
    isMutating,
    mutationError,
    loadAllGarmentsAdmin,
    createGarment,
    updateGarment,
    enableGarment,
    disableGarment,
    clearMutation,
  } = useGarments();

  const { categories, loadAllCategoriesAdmin } = useCategories();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGarment, setEditingGarment] = useState<Garment | null>(null);
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadAllGarmentsAdmin();
    loadAllCategoriesAdmin();
  }, [loadAllGarmentsAdmin, loadAllCategoriesAdmin]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadAllGarmentsAdmin(), loadAllCategoriesAdmin()]);
    setRefreshing(false);
  }, [loadAllGarmentsAdmin, loadAllCategoriesAdmin]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c._id, c.name));
    return map;
  }, [categories]);

  const openCreateModal = () => {
    setEditingGarment(null);
    setFormCategoryId(selectedCategoryId || (categories[0]?._id ?? ""));
    setName("");
    setDescription("");
    setIcon("shirt-outline");
    setDisplayOrder(garments.length.toString());
    setFormError(null);
    clearMutation();
    setModalVisible(true);
  };

  const openEditModal = (garment: Garment) => {
    setEditingGarment(garment);
    setFormCategoryId(garment.categoryId);
    setName(garment.name);
    setDescription(garment.description || "");
    setIcon(garment.icon || "");
    setDisplayOrder((garment.displayOrder ?? 0).toString());
    setFormError(null);
    clearMutation();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingGarment(null);
    setFormError(null);
    clearMutation();
  };

  const handleSave = async () => {
    if (!formCategoryId) {
      setFormError("Please select a category for this garment.");
      return;
    }
    if (!name.trim()) {
      setFormError("Garment name is required.");
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      setFormError("Garment name must be between 2 and 50 characters.");
      return;
    }
    const orderNum = parseInt(displayOrder, 10);
    if (isNaN(orderNum) || orderNum < 0) {
      setFormError("Display order must be a positive number.");
      return;
    }

    setFormError(null);

    if (editingGarment) {
      const updateData: UpdateGarmentInput = {
        categoryId: formCategoryId,
        name: name.trim().toLowerCase(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        displayOrder: orderNum,
      };
      const success = await updateGarment(editingGarment._id, updateData);
      if (success) {
        closeModal();
      }
    } else {
      const createData: CreateGarmentInput = {
        categoryId: formCategoryId,
        name: name.trim().toLowerCase(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        displayOrder: orderNum,
        isActive: true,
      };
      const success = await createGarment(createData);
      if (success) {
        closeModal();
      }
    }
  };

  const handleToggleStatus = (garment: Garment) => {
    const action = garment.isActive ? "Disable" : "Enable";
    const confirmMessage = garment.isActive
      ? `Are you sure you want to disable "${garment.name}"? Customers will not see this garment in catalog.`
      : `Are you sure you want to enable "${garment.name}"?`;

    if (Platform.OS === "web") {
      if (window.confirm(confirmMessage)) {
        if (garment.isActive) {
          disableGarment(garment._id);
        } else {
          enableGarment(garment._id);
        }
      }
    } else {
      Alert.alert(`${action} Garment`, confirmMessage, [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: garment.isActive ? "destructive" : "default",
          onPress: () => {
            if (garment.isActive) {
              disableGarment(garment._id);
            } else {
              enableGarment(garment._id);
            }
          },
        },
      ]);
    }
  };

  const handleReorder = async (garment: Garment, direction: "up" | "down") => {
    const currentOrder = garment.displayOrder ?? 0;
    const newOrder = direction === "up" ? Math.max(0, currentOrder - 1) : currentOrder + 1;
    if (newOrder === currentOrder) return;
    await updateGarment(garment._id, { displayOrder: newOrder });
  };

  const filteredGarments = useMemo(() => {
    return garments
      .filter((g) => {
        if (selectedCategoryId && g.categoryId !== selectedCategoryId) return false;
        if (statusFilter === "active") return g.isActive;
        if (statusFilter === "inactive") return !g.isActive;
        return true;
      })
      .filter((g) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const catName = (categoryMap.get(g.categoryId) || "").toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          catName.includes(q) ||
          (g.description && g.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [garments, selectedCategoryId, statusFilter, searchQuery, categoryMap]);

  return (
    <View style={styles.container}>
      {/* Category Filter Chips Bar */}
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
                {c.name.toUpperCase()} {!c.isActive ? "(Disabled)" : ""}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Top action bar: Filter chips & Add button */}
      <View style={styles.actionBar}>
        <View style={styles.statusFilterRow}>
          <TouchableOpacity
            style={[
              styles.statusChip,
              statusFilter === "all" && { backgroundColor: colors.surfaceMuted, borderColor: colors.primary },
            ]}
            onPress={() => setStatusFilter("all")}
          >
            <AppText
              variant="caption"
              color={statusFilter === "all" ? "brand" : "secondary"}
            >
              All ({garments.length})
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusChip,
              statusFilter === "active" && { backgroundColor: colors.surfaceMuted, borderColor: colors.primary },
            ]}
            onPress={() => setStatusFilter("active")}
          >
            <AppText
              variant="caption"
              color={statusFilter === "active" ? "brand" : "secondary"}
            >
              Active ({garments.filter((g) => g.isActive).length})
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusChip,
              statusFilter === "inactive" && { backgroundColor: colors.surfaceMuted, borderColor: colors.primary },
            ]}
            onPress={() => setStatusFilter("inactive")}
          >
            <AppText
              variant="caption"
              color={statusFilter === "inactive" ? "brand" : "secondary"}
            >
              Inactive ({garments.filter((g) => !g.isActive).length})
            </AppText>
          </TouchableOpacity>
        </View>

        <AppButton
          title="+ Add Garment"
          size="sm"
          onPress={openCreateModal}
          style={styles.addButton}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <AppInput
          placeholder="Search garments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={18} color={colors.textSecondary} />}
        />
      </View>

      {isLoading && !refreshing && garments.length === 0 ? (
        <View style={styles.loaderCenter}>
          <AppLoader variant="spinner" size="large" message="Loading garments..." />
        </View>
      ) : filteredGarments.length === 0 ? (
        <EmptyState
          title="No Garments Found"
          description={
            searchQuery
              ? `No garments match "${searchQuery}"`
              : "No garments found in this selection."
          }
          icon={<Ionicons name="shirt-outline" size={48} color={colors.primary} />}
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
              <AppCard key={garment._id} style={styles.card} variant="elevated">
                <View style={styles.cardHeader}>
                  <View style={styles.garmentInfo}>
                    <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceMuted }]}>
                      <Ionicons
                        name={(garment.icon as any) || "shirt-outline"}
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.nameBlock}>
                      <View style={styles.titleRow}>
                        <AppText variant="h3" style={styles.garmentName}>
                          {garment.name.toUpperCase()}
                        </AppText>
                        <AppBadge
                          label={garment.isActive ? "ACTIVE" : "INACTIVE"}
                          variant={garment.isActive ? "success" : "neutral"}
                          size="sm"
                        />
                      </View>
                      <View style={styles.categoryBadgeRow}>
                        <AppBadge
                          label={catName.toUpperCase()}
                          variant="info"
                          size="sm"
                        />
                        {garment.description ? (
                          <AppText variant="caption" color="secondary" numberOfLines={1}>
                            • {garment.description}
                          </AppText>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {/* Display Order & Reorder Controls */}
                  <View style={styles.orderControls}>
                    <AppBadge
                      label={`#${garment.displayOrder ?? 0}`}
                      variant="neutral"
                      size="sm"
                    />
                    <View style={styles.orderArrows}>
                      <TouchableOpacity
                        onPress={() => handleReorder(garment, "up")}
                        style={[styles.arrowButton, { backgroundColor: colors.surfaceMuted }]}
                      >
                        <Ionicons name="chevron-up" size={16} color={colors.textPrimary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleReorder(garment, "down")}
                        style={[styles.arrowButton, { backgroundColor: colors.surfaceMuted }]}
                      >
                        <Ionicons name="chevron-down" size={16} color={colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <AppButton
                    title="Edit / Move Category"
                    variant="outline"
                    size="sm"
                    onPress={() => openEditModal(garment)}
                    leftIcon={<Ionicons name="pencil-outline" size={14} color={colors.primary} />}
                    style={styles.actionBtn}
                  />
                  <AppButton
                    title={garment.isActive ? "Disable" : "Enable"}
                    variant={garment.isActive ? "danger" : "secondary"}
                    size="sm"
                    onPress={() => handleToggleStatus(garment)}
                    leftIcon={
                      <Ionicons
                        name={garment.isActive ? "pause-circle-outline" : "play-circle-outline"}
                        size={14}
                        color={garment.isActive ? colors.error : colors.primary}
                      />
                    }
                    style={styles.actionBtn}
                  />
                </View>
              </AppCard>
            );
          })}
        </ScrollView>
      )}

      {/* Create / Edit Garment Modal */}
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
                {editingGarment ? "Edit Garment" : "New Garment"}
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

              {/* Category Selector (allows moving garment to another category!) */}
              <View style={styles.pickerBlock}>
                <AppText variant="label" style={styles.pickerLabel}>
                  Assign Category *
                </AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.modalCategoryRow}
                >
                  {categories.map((c) => {
                    const isSelected = formCategoryId === c._id;
                    return (
                      <TouchableOpacity
                        key={c._id}
                        style={[
                          styles.modalCategoryChip,
                          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                        onPress={() => setFormCategoryId(c._id)}
                      >
                        <AppText
                          variant="caption"
                          color={isSelected ? "inverse" : "secondary"}
                        >
                          {c.name.toUpperCase()} {!c.isActive ? "(Inactive)" : ""}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <AppInput
                label="Garment Name *"
                placeholder="e.g. Formal Shirt, Jeans, Saree"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <AppInput
                label="Description"
                placeholder="Optional description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
              />

              <AppInput
                label="Icon Name"
                placeholder="e.g. shirt-outline"
                value={icon}
                onChangeText={setIcon}
              />

              <AppInput
                label="Display Order"
                placeholder="0"
                value={displayOrder}
                onChangeText={setDisplayOrder}
                keyboardType="numeric"
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
                  title={editingGarment ? "Save Changes" : "Create Garment"}
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
  statusFilterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  addButton: {
    width: "auto",
    paddingHorizontal: spacing.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  loaderCenter: {
    padding: spacing.xl,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  garmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  nameBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 2,
  },
  garmentName: {
    letterSpacing: 0.5,
  },
  categoryBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
    marginTop: 2,
  },
  orderControls: {
    alignItems: "flex-end",
    gap: spacing.xxs,
  },
  orderArrows: {
    flexDirection: "row",
    gap: 4,
  },
  arrowButton: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.1)",
    paddingTop: spacing.sm,
  },
  actionBtn: {
    width: "auto",
    paddingHorizontal: spacing.md,
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
  pickerBlock: {
    gap: spacing.xs,
  },
  pickerLabel: {
    marginBottom: 2,
  },
  modalCategoryRow: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  modalCategoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
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
