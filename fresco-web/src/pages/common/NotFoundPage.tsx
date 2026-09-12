import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Home, ArrowLeft } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

export const NotFoundPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  let homePath = "/catalog";
  if (isAuthenticated && user) {
    if (user.role === "ADMIN") {
      homePath = "/admin";
    } else if (user.role === "DELIVERY_PARTNER") {
      homePath = "/partner";
    } else {
      homePath = "/catalog";
    }
  }

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <Card
        className="fresco-card"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "3rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            color: "var(--primary)",
          }}
        >
          <Sparkles size={36} />
        </div>

        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: 900,
            margin: "0 0 0.5rem 0",
            color: "var(--primary)",
            lineHeight: 1,
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            margin: "0 0 0.75rem 0",
            color: "var(--text-primary)",
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            margin: "0 0 2rem 0",
            lineHeight: 1.5,
          }}
        >
          The page you are looking for might have been moved, deleted, or is temporarily unavailable.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
          <Link to={homePath} className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Home size={16} /> Return Home
          </Link>
        </div>
      </Card>
    </div>
  );
};
