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

export const AdminCustomersScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    customers,
    isFetchingCustomers,
    isUpdatingStatus,
    error,
    loadCustomers,
    updateUserStatus,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomers({ search: searchQuery });
    setRefreshing(false);
  }, [loadCustomers, searchQuery]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      loadCustomers({ search: query });
    },
    [loadCustomers]
  );

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter === "ALL") return true;
      return c.status === statusFilter;
    });
  }, [customers, statusFilter]);

  const handleToggleStatus = useCallback(
    (customer: User) => {
      const nextStatus = customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const actionText = nextStatus === "ACTIVE" ? "Activate" : "Deactivate";

      Alert.alert(
        `${actionText} Customer Account`,
        `Are you sure you want to ${actionText.toLowerCase()} account for ${customer.firstName} ${customer.lastName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: actionText,
            style: nextStatus === "INACTIVE" ? "destructive" : "default",
            onPress: async () => {
              const success = await updateUserStatus(customer._id, nextStatus);
              if (success && selectedCustomer?._id === customer._id) {
                setSelectedCustomer((prev) => (prev ? { ...prev, status: nextStatus } : null));
              }
            },
          },
        ]
      );
    },
    [updateUserStatus, selectedCustomer]
  );

  const renderItem = ({ item }: { item: User }) => {
    const isActive = item.status === "ACTIVE";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedCustomer(item)}
      >
        <AppCard variant="elevated" padding="md" style={styles.customerCard}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={colors.primary} />
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
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <AppText variant="caption" color="secondary" style={styles.detailText}>
                Joined {formatDate(item.createdAt)}
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
        title="Customer Management"
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
                  {filter === "ALL" ? `All (${customers.length})` : filter}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main List */}
      {isFetchingCustomers && customers.length === 0 ? (
        <View style={styles.loaderContainer}>
          <AppLoader variant="spinner" size="large" message="Loading customers..." />
        </View>
      ) : error ? (
        <ErrorState
          title="Failed to Load Customers"
          message={error.message}
          onRetry={loadCustomers}
        />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title="No Customers Found"
          description={
            searchQuery
              ? `No customers matched "${searchQuery}". Try a different search.`
              : "There are currently no customer accounts in the system."
          }
          icon={<Ionicons name="people-outline" size={48} color={colors.primary} />}
        />
      ) : (
        <FlatList
          data={filteredCustomers}
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

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedCustomer(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
                  <AppText variant="h3" color="primary" style={styles.modalTitle}>
                    Customer Details
                  </AppText>
                </View>
                <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
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
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </AppText>
                </View>

                <View style={styles.modalField}>
                  <AppText variant="caption" color="secondary">
                    Email Address:
                  </AppText>
                  <AppText variant="body" color="primary">
                    {selectedCustomer.email}
                  </AppText>
                </View>

                <View style={styles.modalField}>
                  <AppText variant="caption" color="secondary">
                    Phone Number:
                  </AppText>
                  <AppText variant="body" color="primary">
                    {selectedCustomer.phone ? formatPhone(selectedCustomer.phone) : "None provided"}
                  </AppText>
                </View>

                <View style={styles.modalField}>
                  <AppText variant="caption" color="secondary">
                    Account Status:
                  </AppText>
                  <AppBadge
                    label={selectedCustomer.status}
                    variant={selectedCustomer.status === "ACTIVE" ? "success" : "neutral"}
                    size="md"
                  />
                </View>

                <View style={styles.modalField}>
                  <AppText variant="caption" color="secondary">
                    Joined Date:
                  </AppText>
                  <AppText variant="body" color="primary">
                    {formatDate(selectedCustomer.createdAt)}
                  </AppText>
                </View>
              </View>

              <AppDivider spacing="md" />

              <View style={styles.modalActions}>
                <AppButton
                  title={
                    selectedCustomer.status === "ACTIVE"
                      ? "Deactivate Account"
                      : "Activate Account"
                  }
                  variant={selectedCustomer.status === "ACTIVE" ? "danger" : "primary"}
                  loading={isUpdatingStatus}
                  onPress={() => handleToggleStatus(selectedCustomer)}
                  leftIcon={
                    <Ionicons
                      name={
                        selectedCustomer.status === "ACTIVE"
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
  customerCard: {
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
