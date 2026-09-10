import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { AdminStackParamList } from "../../../types/navigation.types";
import { User } from "../../../types/auth.types";
import { useAdminUsers } from "../../../hooks/useAdminUsers";
import {
  AppText,
  AppHeader,
  AppCard,
  AppBadge,
  AppButton,
  AppInput,
  AppDivider,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../../components/common";
import { useTheme, colors, spacing, radius, shadows } from "../../../theme";
import { formatDate, formatPhone } from "../../../utils/formatters";

type Props = NativeStackScreenProps<AdminStackParamList, any>;

export const AdminPartnersScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    partners,
    isFetchingPartners,
    isUpdatingStatus,
    error,
    loadPartners,
    updateUserStatus,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPartners({ search: searchQuery });
    setRefreshing(false);
  }, [loadPartners, searchQuery]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      loadPartners({ search: query });
    },
    [loadPartners]
  );

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      if (statusFilter === "ALL") return true;
      return p.status === statusFilter;
    });
  }, [partners, statusFilter]);

  const handleToggleStatus = useCallback(
    (partner: User) => {
      const nextStatus = partner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const actionText = nextStatus === "ACTIVE" ? "Activate" : "Deactivate";

      Alert.alert(
        `${actionText} Partner Account`,
        `Are you sure you want to ${actionText.toLowerCase()} partner account for ${partner.firstName} ${partner.lastName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: actionText,
            style: nextStatus === "INACTIVE" ? "destructive" : "default",
            onPress: async () => {
              const success = await updateUserStatus(partner._id, nextStatus);
              if (success && selectedPartner?._id === partner._id) {
                setSelectedPartner((prev) => (prev ? { ...prev, status: nextStatus } : null));
              }
            },
          },
        ]
      );
    },
    [updateUserStatus, selectedPartner]
  );

  const renderItem = ({ item }: { item: User }) => {
    const isActive = item.status === "ACTIVE";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedPartner(item)}
      >
        <AppCard variant="elevated" padding="md" style={styles.partnerCard}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Ionicons name="bicycle" size={20} color={colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <AppText variant="bodyBold" color="primary">
                {item.firstName} {item.lastName}
              </AppText>
              <AppText variant="caption" color="secondary">
                {item.email}
              </AppText>
            </View>
            <AppBadge
              label={item.status}
              variant={isActive ? "success" : "neutral"}
              size="sm"
            />
          </View>

          <AppDivider spacing="xs" />

          <View style={styles.cardFooter}>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
              <AppText variant="caption" color="secondary" style={styles.detailText}>
                {item.phone ? formatPhone(item.phone) : "No Phone"}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.textSecondary} />
              <AppText variant="caption" color="secondary" style={styles.detailText}>
                Role: {item.role}
              </AppText>
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="Delivery Partner Management"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Search & Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchInput}>
          <AppInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search by name, email, or phone..."
            leftIcon={<Ionicons name="search-outline" size={18} color={colors.textSecondary} />}
            rightIcon={
              searchQuery ? (
                <TouchableOpacity onPress={() => handleSearch("")}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterChipsRow}>
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filter) => {
            const isSelected = statusFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surfaceMuted,
                    borderColor: isSelected
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={() => setStatusFilter(filter)}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? "inverse" : "primary"}
                  style={styles.chipText}
                >
                  {filter === "ALL" ? `All (${partners.length})` : filter}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main List */}
      {isFetchingPartners && partners.length === 0 ? (
        <View style={styles.loaderContainer}>
          <AppLoader variant="spinner" size="large" message="Loading partners..." />
        </View>
      ) : error ? (
        <ErrorState
          title="Failed to Load Partners"
          message={error.message}
          onRetry={loadPartners}
        />
      ) : filteredPartners.length === 0 ? (
        <EmptyState
          title="No Delivery Partners Found"
          description={
            searchQuery
              ? `No partners matched "${searchQuery}". Try a different search.`
              : "There are currently no delivery partner accounts in the system."
          }
          icon={<Ionicons name="bicycle-outline" size={48} color={colors.primary} />}
        />
      ) : (
        <FlatList
          data={filteredPartners}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Partner Details Modal */}
      {selectedPartner && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPartner(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <Ionicons name="bicycle" size={28} color={colors.primary} />
                  <AppText variant="h3" color="primary" style={styles.modalTitle}>
                    Partner Profile
                  </AppText>
                </View>
                <TouchableOpacity onPress={() => setSelectedPartner(null)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <AppDivider spacing="sm" />

              <View style={styles.modalBody}>
                <View style={styles.modalField}>
                  <AppText variant="caption" color="secondary">
                    Full Name:
                  </AppText>
                  <AppText variant="bodyBold" color="primary">
                    {selectedPartner.firstName} {selectedPartner.lastName}
                  </AppText>
                </View>

                <View style={styles.modalField}>
                  <AppText variant="caption" color="secondary">
                    Email Address:
                  </AppText>
                  <AppText variant="body" color="primary">
                    {selectedPartner.email}
                  </AppText>
                </View>

                <View style={styles.modalField}>
                  <AppText variant="caption" color="secondary">
                    Phone Number:
                  </AppText>
                  <AppText variant="body" color="primary">
                    {selectedPartner.phone ? formatPhone(selectedPartner.phone) : "None provided"}
                  </AppText>
                </View>

                <View style={styles.modalField}>
                  <AppText variant="caption" color="secondary">
                    Operational Status:
                  </AppText>
                  <AppBadge
                    label={selectedPartner.status}
                    variant={selectedPartner.status === "ACTIVE" ? "success" : "neutral"}
                    size="md"
                  />
                </View>

                <View style={styles.modalField}>
                  <AppText variant="caption" color="secondary">
                    Joined Date:
                  </AppText>
                  <AppText variant="body" color="primary">
                    {formatDate(selectedPartner.createdAt)}
                  </AppText>
                </View>
              </View>

              <AppDivider spacing="md" />

              <View style={styles.modalActions}>
                <AppButton
                  title={
                    selectedPartner.status === "ACTIVE"
                      ? "Deactivate Account"
                      : "Activate Account"
                  }
                  variant={selectedPartner.status === "ACTIVE" ? "danger" : "primary"}
                  loading={isUpdatingStatus}
                  onPress={() => handleToggleStatus(selectedPartner)}
                  leftIcon={
                    <Ionicons
                      name={
                        selectedPartner.status === "ACTIVE"
                          ? "close-circle-outline"
                          : "checkmark-circle-outline"
                      }
                      size={18}
                      color={colors.textInverse}
                    />
                  }
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchInput: {
    marginBottom: spacing.xs,
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  partnerCard: {
    borderRadius: radius.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.screenPadding,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 440,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.modal,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalBody: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modalField: {
    gap: 2,
  },
  modalActions: {
    paddingTop: spacing.xs,
  },
});
