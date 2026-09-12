import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Truck, CheckSquare, History, User, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const PartnerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Assigned Tasks", path: "/partner/tasks", icon: <CheckSquare size={18} /> },
    { label: "Completed History", path: "/partner/history", icon: <History size={18} /> },
    { label: "Profile", path: "/partner/profile", icon: <User size={18} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--background)" }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          className="fresco-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "4rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "#10B981", // Emerald Green for Delivery
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--text-primary)" }}>
                FRESCO
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--success)", fontWeight: 700, textTransform: "uppercase" }}>
                Delivery Partner Portal
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Partner: <strong>{user?.firstName}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              style={{ padding: "0.375rem", color: "var(--error)" }}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Subnav Tabs */}
        <div
          className="fresco-container"
          style={{
            display: "flex",
            gap: "1rem",
            borderTop: "1px solid var(--border-light)",
            paddingTop: "0.25rem",
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                  padding: "0.625rem 0.25rem",
                  borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "1.5rem 0" }}>
        <div className="fresco-container">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "var(--surface)", borderTop: "1px solid var(--border)", padding: "1rem 0", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
        FRESCO Logistics & Delivery Partner System
      </footer>
    </div>
  );
};
