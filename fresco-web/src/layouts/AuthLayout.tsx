import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--background)",
        padding: "1.5rem",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={24} />
          </div>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.025em" }}>
            FRESCO
          </span>
        </Link>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.375rem" }}>
          Premium Laundry & Fabric Care Platform
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "28rem",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: "2rem",
        }}
      >
        <Outlet />
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
        © {new Date().getFullYear()} FRESCO Laundry Care. All rights reserved.
      </div>
    </div>
  );
};
