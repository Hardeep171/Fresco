import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  Truck,
  UserCheck,
  UserX,
} from "lucide-react";
import { userApi } from "../../api/user.api";
import { User } from "../../types/auth.types";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Spinner } from "../../components/common/Spinner";
import { Alert } from "../../components/common/Alert";

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getUsers({
        role: selectedRole !== "ALL" ? selectedRole : undefined,
      });
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const handleToggleStatus = async (user: User) => {
    setActionUserId(user._id);
    setError(null);
    setSuccessMsg(null);
    try {
      const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await userApi.updateUserStatus(user._id, newStatus);
      setSuccessMsg(`User status updated to ${newStatus}.`);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update user status.");
    } finally {
      setActionUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [users, searchQuery]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            User Management
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
            Oversee customer accounts, delivery partners, and administrative permissions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="secondary" size="sm" onClick={fetchUsers} leftIcon={<RefreshCw size={14} />}>
            Refresh
          </Button>
        </div>
      </div>

      {successMsg && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
        </div>
      )}

      {error && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Role Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {[
          { label: "All Users", value: "ALL" },
          { label: "Customers", value: "CUSTOMER" },
          { label: "Delivery Partners", value: "DELIVERY_PARTNER" },
          { label: "Admins", value: "ADMIN" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedRole(tab.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: selectedRole === tab.value ? "var(--primary)" : "var(--card-bg)",
              color: selectedRole === tab.value ? "#ffffff" : "var(--text-secondary)",
              boxShadow: selectedRole === tab.value ? "var(--shadow-sm)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <Card className="fresco-card" style={{ padding: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ flex: "1 1 300px", maxWidth: "450px" }}>
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Showing <strong>{filteredUsers.length}</strong> users
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="fresco-card">
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Spinner size="lg" color="var(--primary)" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Users size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              No users found
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              No accounts match the selected role or search query.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="fresco-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    User
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Contact
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Role
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Status
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Joined
                  </th>
                  <th style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const roleBadgeColor =
                    user.role === "ADMIN"
                      ? { bg: "rgba(139, 92, 246, 0.15)", text: "#8B5CF6" }
                      : user.role === "DELIVERY_PARTNER"
                      ? { bg: "rgba(245, 158, 11, 0.15)", text: "var(--warning)" }
                      : { bg: "rgba(59, 130, 246, 0.15)", text: "var(--primary)" };

                  const isCurrentAction = actionUserId === user._id;

                  return (
                    <tr key={user._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                          {user.firstName} {user.lastName}
                        </div>
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem" }}>
                        <div style={{ color: "var(--text-primary)" }}>{user.email}</div>
                        {user.phone && (
                          <div style={{ color: "var(--text-muted)" }}>{user.phone}</div>
                        )}
                      </td>

                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: roleBadgeColor.bg,
                            color: roleBadgeColor.text,
                          }}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor:
                              user.status === "ACTIVE"
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(239, 68, 68, 0.15)",
                            color:
                              user.status === "ACTIVE"
                                ? "var(--success)"
                                : "var(--error)",
                          }}
                        >
                          {user.status || "ACTIVE"}
                        </span>
                      </td>

                      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
                      </td>

                      <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                        {user.role !== "ADMIN" && (
                          <Button
                            variant={user.status === "ACTIVE" ? "danger" : "success"}
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            isLoading={isCurrentAction}
                            leftIcon={user.status === "ACTIVE" ? <UserX size={14} /> : <UserCheck size={14} />}
                          >
                            {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
