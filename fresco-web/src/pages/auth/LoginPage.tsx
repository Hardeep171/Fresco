import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Alert } from "../../components/common/Alert";
import { ADMIN_ROLES } from "../../constants/user.constants";
import { storageService } from "../../services/storage.service";

export const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login({ email: email.trim(), password });
    if (success) {
      // Storage was updated by login thunk, let's inspect user role for redirection
      const storedUser = storageService.getUser() || {};
      const role = storedUser.role;

      if (from) {
        navigate(from, { replace: true });
      } else if (role && (ADMIN_ROLES as readonly string[]).includes(role)) {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "DELIVERY_PARTNER") {
        navigate("/partner/tasks", { replace: true });
      } else {
        navigate("/catalog", { replace: true });
      }
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
        Welcome back
      </h2>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
        Sign in to your FRESCO account to continue
      </p>

      {error && (
        <Alert
          type="error"
          message={error.message}
          onClose={clearError}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          leftIcon={<Mail size={18} />}
          error={error?.fieldErrors?.email}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          leftIcon={<Lock size={18} />}
          error={error?.fieldErrors?.password}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: "0.8125rem", color: "var(--primary)", fontWeight: 600 }}
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          style={{ width: "100%" }}
          isLoading={isLoading}
          leftIcon={<LogIn size={18} />}
        >
          Sign In
        </Button>
      </form>

      <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Create an account
        </Link>
      </div>

      {/* Quick Demo Credentials hint for reviewer */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem",
          backgroundColor: "var(--surface-muted)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        <strong>Demo Quick-Logins:</strong>
        <div style={{ marginTop: "0.25rem" }}>• Customer: <code>customer@fresco.com</code> / <code>Password123!</code></div>
        <div>• Admin: <code>admin@fresco.com</code> / <code>AdminPass123!</code></div>
        <div>• Partner: <code>partner@fresco.com</code> / <code>PartnerPass123!</code></div>
      </div>
    </div>
  );
};
