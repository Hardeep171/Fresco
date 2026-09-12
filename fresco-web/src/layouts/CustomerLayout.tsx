import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Clock,
  MapPin,
  Layers,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItemCount, loadCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { label: "Catalog", path: "/catalog", icon: <Layers size={18} /> },
    { label: "My Orders", path: "/orders", icon: <Clock size={18} /> },
    { label: "Addresses", path: "/addresses", icon: <MapPin size={18} /> },
    { label: "Profile", path: "/profile", icon: <UserIcon size={18} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--background)" }}>
      {/* Top Navigation Bar */}
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
          {/* Logo */}
          <Link to="/catalog" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={20} />
            </div>
            <span style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>
              FRESCO
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            style={{ display: "none", alignItems: "center", gap: "1.5rem" }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.9375rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--primary)" : "var(--text-secondary)",
                    padding: "0.5rem 0.25rem",
                    borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                    transition: "color 0.2s",
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions: Cart, User & Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Cart Button */}
            <Link
              to="/cart"
              className="btn btn-secondary btn-sm"
              style={{ position: "relative", padding: "0.5rem 0.875rem" }}
              aria-label="View shopping cart"
            >
              <ShoppingBag size={18} />
              <span className="cart-label" style={{ fontWeight: 600 }}>Cart</span>
              {totalItemCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: "var(--primary)",
                    color: "#ffffff",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    borderRadius: "var(--radius-full)",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--surface)",
                  }}
                >
                  {totalItemCount}
                </span>
              )}
            </Link>

            {/* Desktop User Info & Logout */}
            <div style={{ display: "none", alignItems: "center", gap: "0.75rem" }} className="desktop-user">
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Hi, <strong style={{ color: "var(--text-primary)" }}>{user?.firstName || "Customer"}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                style={{ padding: "0.375rem", color: "var(--text-muted)" }}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost mobile-toggle"
              style={{ padding: "0.5rem" }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: "var(--surface)",
              borderTop: "1px solid var(--border)",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--border-light)", marginBottom: "0.5rem" }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user?.email}</div>
            </div>

            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? "var(--primary-surface)" : "transparent",
                    color: isActive ? "var(--primary)" : "var(--text-primary)",
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "transparent",
                color: "var(--error)",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                marginTop: "0.5rem",
              }}
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem 0" }}>
        <div className="fresco-container">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "var(--surface)",
          borderTop: "1px solid var(--border)",
          padding: "2rem 0",
          marginTop: "auto",
        }}
      >
        <div
          className="fresco-container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>FRESCO Garment Care</span>
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} FRESCO Laundry Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Media Queries for responsive display */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-user { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .desktop-user { display: none !important; }
          .mobile-toggle { display: inline-flex !important; }
          .cart-label { display: none !important; }
        }
      `}</style>
    </div>
  );
};
