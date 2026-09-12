import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { userApi } from "../../api/user.api";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Alert } from "../../components/common/Alert";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await userApi.forgotPassword({ email: email.trim() });
      setSuccessMsg(res.message || "Password reset instructions have been sent to your email.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to request password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
        Forgot Password
      </h2>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
        Enter your registered email address and we'll send reset instructions
      </p>

      {successMsg && (
        <Alert
          type="success"
          message="Instructions Sent"
          description={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}

      {errorMsg && (
        <Alert
          type="error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Registered Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          leftIcon={<Mail size={18} />}
        />

        <div style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}>
          <Button
            type="submit"
            variant="primary"
            style={{ width: "100%" }}
            isLoading={isLoading}
            leftIcon={<Send size={18} />}
          >
            Send Reset Link
          </Button>
        </div>
      </form>

      <div style={{ textAlign: "center", fontSize: "0.875rem" }}>
        <Link
          to="/login"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};
