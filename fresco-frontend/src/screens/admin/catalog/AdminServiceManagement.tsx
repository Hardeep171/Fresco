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
import { useServices } from "../../../hooks/useServices";
import { Service, CreateServiceInput, UpdateServiceInput } from "../../../types/catalog.types";
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

export const AdminServiceManagement: React.FC = () => {
  const { colors } = useTheme();
  const {
    services,
    isLoading,
    isMutating,
    mutationError,
    loadAllServicesAdmin,
    createService,
    updateService,
    enableService,
    disableService,
    clearMutation,
  } = useServices();

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadAllServicesAdmin();
  }, [loadAllServicesAdmin]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllServicesAdmin();
    setRefreshing(false);
  }, [loadAllServicesAdmin]);

  const openCreateModal = () => {
    setEditingService(null);
    setName("");
    setDescription("");
    setIcon("water-outline");
    setDisplayOrder(services.length.toString());
    setFormError(null);
    clearMutation();
    setModalVisible(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || "");
    setIcon(service.icon || "");
    setDisplayOrder((service.displayOrder ?? 0).toString());
    setFormError(null);
    clearMutation();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingService(null);
    setFormError(null);
    clearMutation();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError("Service name is required.");
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      setFormError("Service name must be between 2 and 50 characters.");
      return;
    }
    const orderNum = parseInt(displayOrder, 10);
    if (isNaN(orderNum) || orderNum < 0) {
      setFormError("Display order must be a positive number.");
      return;
    }

    setFormError(null);

    if (editingService) {
      const updateData: UpdateServiceInput = {
        name: name.trim().toLowerCase(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        displayOrder: orderNum,
      };
      const success = await updateService(editingService._id, updateData);
      if (success) {
        closeModal();
      }
    } else {
      const createData: CreateServiceInput = {
        name: name.trim().toLowerCase(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        displayOrder: orderNum,
        isActive: true,
      };
      const success = await createService(createData);
      if (success) {
        closeModal();
      }
    }
  };

  const handleToggleStatus = (service: Service) => {
    const action = service.isActive ? "Disable" : "Enable";
    const confirmMessage = service.isActive
      ? `Are you sure you want to disable "${service.name}"? Customers will not see this service option.`
      : `Are you sure you want to enable "${service.name}"?`;

    if (Platform.OS === "web") {
      if (window.confirm(confirmMessage)) {
        if (service.isActive) {
          disableService(service._id);
        } else {
          enableService(service._id);
        }
      }
    } else {
      Alert.alert(`${action} Service`, confirmMessage, [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: service.isActive ? "destructive" : "default",
          onPress: () => {
            if (service.isActive) {
              disableService(service._id);
            } else {
              enableService(service._id);
            }
          },
        },
      ]);
    }
  };

  const handleReorder = async (service: Service, direction: "up" | "down") => {
    const currentOrder = service.displayOrder ?? 0;
    const newOrder = direction === "up" ? Math.max(0, currentOrder - 1) : currentOrder + 1;
    if (newOrder === currentOrder) return;
    await updateService(service._id, { displayOrder: newOrder });
  };

  const filteredServices = useMemo(() => {
    return services
      .filter((s) => {
        if (filter === "active") return s.isActive;
        if (filter === "inactive") return !s.isActive;
        return true;
      })
      .filter((s) => {
        if (!searchQuery.trim()) return true;
        return (
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [services, filter, searchQuery]);

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
              All ({services.length})
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
              Active ({services.filter((s) => s.isActive).length})
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
              Inactive ({services.filter((s) => !s.isActive).length})
            </AppText>
          </TouchableOpacity>
        </View>

        <AppButton
          title="+ Add Service"
          size="sm"
          onPress={openCreateModal}
          style={styles.addButton}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <AppInput
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={18} color={colors.textSecondary} />}
        />
      </View>

      {isLoading && !refreshing && services.length === 0 ? (
        <View style={styles.loaderCenter}>
          <AppLoader variant="spinner" size="large" message="Loading services..." />
        </View>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          title="No Services Found"
          description={
            searchQuery
              ? `No services match "${searchQuery}"`
              : "No services have been created yet."
          }
          icon={<Ionicons name="cube-outline" size={48} color={colors.primary} />}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {filteredServices.map((service) => (
            <AppCard key={service._id} style={styles.card} variant="elevated">
              <View style={styles.cardHeader}>
                <View style={styles.serviceInfo}>
                  <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceMuted }]}>
                    <Ionicons
                      name="water-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.nameBlock}>
                    <View style={styles.titleRow}>
                      <AppText variant="h3" style={styles.serviceName}>
                        {service.name.toUpperCase()}
                      </AppText>
                      <AppBadge
                        label={service.isActive ? "ACTIVE" : "INACTIVE"}
                        variant={service.isActive ? "success" : "neutral"}
                        size="sm"
                      />
                    </View>
                    {service.description ? (
                      <AppText variant="caption" color="secondary" numberOfLines={2}>
                        {service.description}
                      </AppText>
                    ) : null}
                  </View>
                </View>

                {/* Display Order & Reorder Controls */}
                <View style={styles.orderControls}>
                  <AppBadge
                    label={`Order #${service.displayOrder ?? 0}`}
                    variant="neutral"
                    size="sm"
                  />
                  <View style={styles.orderArrows}>
                    <TouchableOpacity
                      onPress={() => handleReorder(service, "up")}
                      style={[styles.arrowButton, { backgroundColor: colors.surfaceMuted }]}
                    >
                      <Ionicons name="chevron-up" size={16} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleReorder(service, "down")}
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
                  onPress={() => openEditModal(service)}
                  leftIcon={<Ionicons name="pencil-outline" size={14} color={colors.primary} />}
                  style={styles.actionBtn}
                />
                <AppButton
                  title={service.isActive ? "Disable" : "Enable"}
                  variant={service.isActive ? "danger" : "secondary"}
                  size="sm"
                  onPress={() => handleToggleStatus(service)}
                  leftIcon={
                    <Ionicons
                      name={service.isActive ? "pause-circle-outline" : "play-circle-outline"}
                      size={14}
                      color={service.isActive ? colors.error : colors.primary}
                    />
                  }
                  style={styles.actionBtn}
                />
              </View>
            </AppCard>
          ))}
        </ScrollView>
      )}

      {/* Create / Edit Service Modal */}
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
                {editingService ? "Edit Service" : "New Service"}
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
                label="Service Name *"
                placeholder="e.g. Wash & Fold, Steam Press, Dry Clean"
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
                placeholder="e.g. sparkles, water-outline"
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
                  title={editingService ? "Save Changes" : "Create Service"}
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
  serviceInfo: {
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
  serviceName: {
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
