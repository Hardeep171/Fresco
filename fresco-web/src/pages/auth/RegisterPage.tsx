import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Alert } from "../../components/common/Alert";

export const RegisterPage: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setClientError(null);

    if (password !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setClientError("Password must be at least 8 characters long.");
      return;
    }

    const success = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      password,
    });

    if (success) {
      navigate("/catalog", { replace: true });
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
        Create Account
      </h2>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
        Sign up for professional garment care with FRESCO
      </p>

      {(clientError || error) && (
        <Alert
          type="error"
          message={clientError || error?.message || "Registration failed"}
          onClose={() => {
            setClientError(null);
            clearError();
          }}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Input
            label="First Name"
            placeholder="Jane"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            leftIcon={<User size={18} />}
            error={error?.fieldErrors?.firstName}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            leftIcon={<User size={18} />}
            error={error?.fieldErrors?.lastName}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="jane.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          leftIcon={<Mail size={18} />}
          error={error?.fieldErrors?.email}
        />

        <Input
          label="Phone Number (Optional)"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone size={18} />}
          error={error?.fieldErrors?.phone}
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          leftIcon={<Lock size={18} />}
          error={error?.fieldErrors?.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          leftIcon={<Lock size={18} />}
        />

        <div style={{ marginTop: "0.5rem", marginBottom: "1.25rem" }}>
          <Button
            type="submit"
            variant="primary"
            style={{ width: "100%" }}
            isLoading={isLoading}
            leftIcon={<UserPlus size={18} />}
          >
            Create Account
          </Button>
        </div>
      </form>

      <div style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};
