import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  Truck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
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
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
          WebkitOverflowScrolling: "touch",
        }}
      >
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
              whiteSpace: "nowrap",
              flexShrink: 0,
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
          <div style={{ flex: "1 1 300px", maxWidth: "450px", width: "100%" }}>
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

      {/* Users Cards Grid */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <Spinner size="lg" color="var(--primary)" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="fresco-card">
          <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Users size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
              No users found
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              No accounts match the selected role or search query.
            </p>
          </div>
        </Card>
      ) : (
        <div className="admin-card-grid-3">
          {filteredUsers.map((user) => {
            const roleBadgeColor =
              user.role === "ADMIN"
                ? { bg: "rgba(139, 92, 246, 0.15)", text: "#8B5CF6" }
                : user.role === "DELIVERY_PARTNER"
                ? { bg: "rgba(245, 158, 11, 0.15)", text: "var(--warning)" }
                : { bg: "rgba(59, 130, 246, 0.15)", text: "var(--primary)" };

            const isCurrentAction = actionUserId === user._id;

            return (
              <Card
                key={user._id}
                className="fresco-card fresco-card-hover"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "1.25rem",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {/* Top: Name & Role Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-primary)" }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.25rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        <Calendar size={13} />
                        <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.6rem",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: roleBadgeColor.bg,
                        color: roleBadgeColor.text,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* Contact Info Box */}
                  <div
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--surface-muted)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", overflow: "hidden" }}>
                      <Mail size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.email}
                      </span>
                    </div>
                    {user.phone ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)" }}>
                        <Phone size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                        <span>{user.phone}</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        <Phone size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                        <span>No phone registered</span>
                      </div>
                    )}
                  </div>

                  {/* Account Status row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      Account Status:
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.55rem",
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
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
                  {user.role !== "ADMIN" ? (
                    <Button
                      variant={user.status === "ACTIVE" ? "danger" : "success"}
                      size="sm"
                      fullWidth
                      onClick={() => handleToggleStatus(user)}
                      isLoading={isCurrentAction}
                      leftIcon={user.status === "ACTIVE" ? <UserX size={14} /> : <UserCheck size={14} />}
                      style={{ minHeight: "40px" }}
                    >
                      {user.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                    </Button>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "0.5rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        backgroundColor: "var(--surface-muted)",
                        borderRadius: "var(--radius-sm)",
                        minHeight: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Administrator (Protected)
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
