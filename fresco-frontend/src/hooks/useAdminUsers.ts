import { useState, useCallback } from "react";
import { userApi } from "../api/user.api";
import { User } from "../types/auth.types";
import { AdminStats, UserFilters } from "../types/user.types";
import { normalizeApiError } from "../api/error";
import { NormalizedApiError } from "../types/api.types";

/**
 * Custom React hook for Admin User Management and System Statistics.
 */
export function useAdminUsers() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [customers, setCustomers] = useState<User[]>([]);
  const [partners, setPartners] = useState<User[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isFetchingCustomers, setIsFetchingCustomers] = useState(false);
  const [isFetchingPartners, setIsFetchingPartners] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    setError(null);
    try {
      const data = await userApi.getAdminStats();
      setStats(data);
      return data;
    } catch (err: unknown) {
      const normalized = normalizeApiError(err);
      setError(normalized);
      return null;
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const loadCustomers = useCallback(async (filters?: UserFilters) => {
    setIsFetchingCustomers(true);
    setError(null);
    try {
      const data = await userApi.getUsers({ ...filters, role: "CUSTOMER" });
      setCustomers(data);
      return data;
    } catch (err: unknown) {
      const normalized = normalizeApiError(err);
      setError(normalized);
      return [];
    } finally {
      setIsFetchingCustomers(false);
    }
  }, []);

  const loadPartners = useCallback(async (filters?: UserFilters) => {
    setIsFetchingPartners(true);
    setError(null);
    try {
      const data = await userApi.getUsers({ ...filters, role: "DELIVERY_PARTNER" });
      setPartners(data);
      return data;
    } catch (err: unknown) {
      const normalized = normalizeApiError(err);
      setError(normalized);
      return [];
    } finally {
      setIsFetchingPartners(false);
    }
  }, []);

  const updateUserStatus = useCallback(
    async (id: string, status: string) => {
      setIsUpdatingStatus(true);
      setError(null);
      try {
        const updated = await userApi.updateUserStatus(id, status);
        // Synchronize in local lists
        setCustomers((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: updated.status } : c))
        );
        setPartners((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: updated.status } : p))
        );
        // Refresh stats
        void loadStats();
        return true;
      } catch (err: unknown) {
        const normalized = normalizeApiError(err);
        setError(normalized);
        return false;
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [loadStats]
  );

  return {
    stats,
    customers,
    partners,
    isLoadingStats,
    isFetchingCustomers,
    isFetchingPartners,
    isUpdatingStatus,
    error,
    loadStats,
    loadCustomers,
    loadPartners,
    updateUserStatus,
  };
}
