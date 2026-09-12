import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { userApi } from "../../api/user.api";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Alert } from "../../components/common/Alert";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await userApi.resetPassword({
        token: token.trim(),
        password,
      });
      setSuccessMsg(res.message || "Your password has been successfully reset.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. The token may be expired or invalid.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
        Reset Password
      </h2>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
        Enter your reset token and choose a new password
      </p>

      {successMsg && (
        <Alert
          type="success"
          message="Password Updated"
          description={`${successMsg} Redirecting to login...`}
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
          label="Reset Token"
          placeholder="Paste verification token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />

        <Input
          label="New Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          leftIcon={<Lock size={18} />}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          leftIcon={<Lock size={18} />}
        />

        <div style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}>
          <Button
            type="submit"
            variant="primary"
            style={{ width: "100%" }}
            isLoading={isLoading}
            leftIcon={<CheckCircle size={18} />}
          >
            Update Password
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
