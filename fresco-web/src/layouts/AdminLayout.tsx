import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  TableProperties,
  Users,
  CreditCard,
  ClipboardCheck,
  LogOut,
  Sparkles,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Orders", path: "/admin/orders", icon: <ClipboardList size={20} /> },
    { label: "Catalog Management", path: "/admin/catalog", icon: <Layers size={20} /> },
    { label: "Pricing Matrix", path: "/admin/pricing", icon: <TableProperties size={20} /> },
    { label: "Users & Partners", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Payment Verification", path: "/admin/payments", icon: <CreditCard size={20} /> },
    { label: "Garment Inspections", path: "/admin/inspections", icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 90,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
        style={{
          width: "16rem",
          backgroundColor: "#0F172A", // Deep Slate for Admin Sidebar
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          zIndex: 100,
          transition: "transform 0.2s ease-in-out",
        }}
      >
        {/* Sidebar Brand Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Link to="/admin/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: "1.125rem", letterSpacing: "0.02em" }}>
                FRESCO
              </span>
              <span style={{ fontSize: "0.6875rem", backgroundColor: "rgba(255,255,255,0.15)", padding: "0.125rem 0.375rem", borderRadius: "4px", marginLeft: "0.5rem" }}>
                ADMIN
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="mobile-close-btn"
            style={{
              background: "transparent",
              border: "none",
              color: "#FFFFFF",
              cursor: "pointer",
              padding: "0.25rem",
            }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "#FFFFFF" : "#94A3B8",
                  transition: "all 0.15s",
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#FFFFFF" }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748B", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Shield size={12} /> {user?.role}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "none",
              color: "#EF4444",
              cursor: "pointer",
              padding: "0.375rem",
            }}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Navbar */}
        <header
          className="admin-header"
          style={{
            height: "4rem",
            backgroundColor: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 80,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="admin-hamburger"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.375rem",
                color: "var(--text-primary)",
              }}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
              Admin Operations
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.375rem", whiteSpace: "nowrap" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--success)", flexShrink: 0 }} />
              <span className="admin-status-text">Live Server Connected</span>
            </span>
          </div>
        </header>

        {/* View Container */}
        <main className="admin-main-content" style={{ flex: 1, padding: "1.75rem", overflowX: "auto" }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar {
            position: static !important;
            transform: none !important;
          }
          .admin-hamburger {
            display: none !important;
          }
          .mobile-close-btn {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-hamburger {
            display: inline-flex !important;
          }
          .mobile-close-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};
