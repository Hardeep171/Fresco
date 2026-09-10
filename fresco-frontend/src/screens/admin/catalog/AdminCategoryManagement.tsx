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
import { useCategories } from "../../../hooks/useCategories";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "../../../types/catalog.types";
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

export const AdminCategoryManagement: React.FC = () => {
  const { colors } = useTheme();
  const {
    categories,
    isLoading,
    isMutating,
    mutationError,
    loadAllCategoriesAdmin,
    createCategory,
    updateCategory,
    enableCategory,
    disableCategory,
    clearMutation,
  } = useCategories();

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadAllCategoriesAdmin();
  }, [loadAllCategoriesAdmin]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllCategoriesAdmin();
    setRefreshing(false);
  }, [loadAllCategoriesAdmin]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIcon("shirt-outline");
    setDisplayOrder(categories.length.toString());
    setFormError(null);
    clearMutation();
    setModalVisible(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIcon(cat.icon || "");
    setDisplayOrder((cat.displayOrder ?? 0).toString());
    setFormError(null);
    clearMutation();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    setFormError(null);
    clearMutation();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      setFormError("Category name must be between 2 and 50 characters.");
      return;
    }
    const orderNum = parseInt(displayOrder, 10);
    if (isNaN(orderNum) || orderNum < 0) {
      setFormError("Display order must be a positive number.");
      return;
    }

    setFormError(null);

    if (editingCategory) {
      const updateData: UpdateCategoryInput = {
        name: name.trim().toLowerCase(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        displayOrder: orderNum,
      };
      const success = await updateCategory(editingCategory._id, updateData);
      if (success) {
        closeModal();
      }
    } else {
      const createData: CreateCategoryInput = {
        name: name.trim().toLowerCase(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        displayOrder: orderNum,
        isActive: true,
      };
      const success = await createCategory(createData);
      if (success) {
        closeModal();
      }
    }
  };

  const handleToggleStatus = (cat: Category) => {
    const action = cat.isActive ? "Disable" : "Enable";
    const confirmMessage = cat.isActive
      ? `Are you sure you want to disable "${cat.name}"? Customer apps will not show this category.`
      : `Are you sure you want to enable "${cat.name}"?`;

    if (Platform.OS === "web") {
      if (window.confirm(confirmMessage)) {
        if (cat.isActive) {
          disableCategory(cat._id);
        } else {
          enableCategory(cat._id);
        }
      }
    } else {
      Alert.alert(`${action} Category`, confirmMessage, [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: cat.isActive ? "destructive" : "default",
          onPress: () => {
            if (cat.isActive) {
              disableCategory(cat._id);
            } else {
              enableCategory(cat._id);
            }
          },
        },
      ]);
    }
  };

  const handleReorder = async (cat: Category, direction: "up" | "down") => {
    const currentOrder = cat.displayOrder ?? 0;
    const newOrder = direction === "up" ? Math.max(0, currentOrder - 1) : currentOrder + 1;
    if (newOrder === currentOrder) return;
    await updateCategory(cat._id, { displayOrder: newOrder });
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => {
        if (filter === "active") return c.isActive;
        if (filter === "inactive") return !c.isActive;
        return true;
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        return (
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [categories, filter, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Top action bar: Filter chips & Add button */}
      <View style={styles.actionBar}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "all" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter("all")}
          >
            <AppText
              variant="caption"
              color={filter === "all" ? "inverse" : "secondary"}
            >
              All ({categories.length})
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "active" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter("active")}
          >
            <AppText
              variant="caption"
              color={filter === "active" ? "inverse" : "secondary"}
            >
              Active ({categories.filter((c) => c.isActive).length})
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "inactive" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter("inactive")}
          >
            <AppText
              variant="caption"
              color={filter === "inactive" ? "inverse" : "secondary"}
            >
              Inactive ({categories.filter((c) => !c.isActive).length})
            </AppText>
          </TouchableOpacity>
        </View>

        <AppButton
          title="+ Add Category"
          size="sm"
          onPress={openCreateModal}
          style={styles.addButton}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <AppInput
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={18} color={colors.textSecondary} />}
        />
      </View>

      {isLoading && !refreshing && categories.length === 0 ? (
        <View style={styles.loaderCenter}>
          <AppLoader variant="spinner" size="large" message="Loading categories..." />
        </View>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          title="No Categories Found"
          description={
            searchQuery
              ? `No categories match "${searchQuery}"`
              : "No categories have been created yet."
          }
          icon={<Ionicons name="file-tray-outline" size={48} color={colors.primary} />}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {filteredCategories.map((cat) => (
            <AppCard key={cat._id} style={styles.card} variant="elevated">
              <View style={styles.cardHeader}>
                <View style={styles.catInfo}>
                  <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceMuted }]}>
                    <Ionicons
                      name={(cat.icon as any) || "shirt-outline"}
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.nameBlock}>
                    <View style={styles.titleRow}>
                      <AppText variant="h3" style={styles.catName}>
                        {cat.name.toUpperCase()}
                      </AppText>
                      <AppBadge
                        label={cat.isActive ? "ACTIVE" : "INACTIVE"}
                        variant={cat.isActive ? "success" : "neutral"}
                        size="sm"
                      />
                    </View>
                    {cat.description ? (
                      <AppText variant="caption" color="secondary" numberOfLines={2}>
                        {cat.description}
                      </AppText>
                    ) : null}
                  </View>
                </View>

                {/* Display Order & Reorder Controls */}
                <View style={styles.orderControls}>
                  <AppBadge
                    label={`Order #${cat.displayOrder ?? 0}`}
                    variant="neutral"
                    size="sm"
                  />
                  <View style={styles.orderArrows}>
                    <TouchableOpacity
                      onPress={() => handleReorder(cat, "up")}
                      style={[styles.arrowButton, { backgroundColor: colors.surfaceMuted }]}
                    >
                      <Ionicons name="chevron-up" size={16} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleReorder(cat, "down")}
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
                  title="Edit"
                  variant="outline"
                  size="sm"
                  onPress={() => openEditModal(cat)}
                  leftIcon={<Ionicons name="pencil-outline" size={14} color={colors.primary} />}
                  style={styles.actionBtn}
                />
                <AppButton
                  title={cat.isActive ? "Disable" : "Enable"}
                  variant={cat.isActive ? "danger" : "secondary"}
                  size="sm"
                  onPress={() => handleToggleStatus(cat)}
                  leftIcon={
                    <Ionicons
                      name={cat.isActive ? "pause-circle-outline" : "play-circle-outline"}
                      size={14}
                      color={cat.isActive ? colors.error : colors.primary}
                    />
                  }
                  style={styles.actionBtn}
                />
              </View>
            </AppCard>
          ))}
        </ScrollView>
      )}

      {/* Create / Edit Category Modal */}
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
                {editingCategory ? "Edit Category" : "New Category"}
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

              <AppInput
                label="Category Name *"
                placeholder="e.g. Shirts, Pants, Dresses"
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
                  title={editingCategory ? "Save Changes" : "Create Category"}
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
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
    flex: 1,
  },
  filterChip: {
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
  catInfo: {
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
  catName: {
    letterSpacing: 0.5,
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
