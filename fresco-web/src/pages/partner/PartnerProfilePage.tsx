import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, Shield, CheckCircle, Truck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useUser } from "../../hooks/useUser";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Alert } from "../../components/common/Alert";

export const PartnerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const {
    profile,
    loadProfile,
    updateProfile,
    changePassword,
    isUpdating,
    isChangingPassword,
    updateError,
    changePasswordError,
    updateSuccess,
    changePasswordSuccess,
    resetUpdateSuccess,
    resetChangePasswordSuccess,
  } = useUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const activeUser = profile || user;
    if (activeUser) {
      setFirstName(activeUser.firstName || "");
      setLastName(activeUser.lastName || "");
      setPhone(activeUser.phone || "");
    }
  }, [profile, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMismatch(null);

    if (newPassword !== confirmPassword) {
      setPasswordMismatch("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMismatch("Password must be at least 6 characters long.");
      return;
    }

    const ok = await changePassword({
      currentPassword,
      newPassword,
    });

    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const activeUser = profile || user;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Partner Profile & Settings
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
          Manage your personal details, delivery partner account, and login security.
        </p>
      </div>

      {/* Account Status Card */}
      <Card className="fresco-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
            }}
          >
            <Truck size={28} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {activeUser?.firstName} {activeUser?.lastName}
              </h2>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  color: "var(--warning)",
                }}
              >
                DELIVERY PARTNER
              </span>
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
              {activeUser?.email} &bull; Account Status:{" "}
              <strong style={{ color: "var(--success)" }}>ACTIVE</strong>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
        {/* Personal Details Form */}
        <Card className="fresco-card">
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--text-primary)" }}>
            Personal Details
          </h3>

          {updateSuccess && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert type="success" message="Profile updated successfully!" onClose={resetUpdateSuccess} />
            </div>
          )}

          {updateError && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert type="error" message={updateError.message} />
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                First Name
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                leftIcon={<User size={16} />}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Last Name
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                leftIcon={<User size={16} />}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Phone Number
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone size={16} />}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Email Address
              </label>
              <Input
                type="email"
                value={activeUser?.email || ""}
                disabled
                leftIcon={<Mail size={16} />}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                Email address cannot be modified.
              </span>
            </div>

            <Button type="submit" variant="primary" isLoading={isUpdating} style={{ marginTop: "0.5rem" }}>
              Save Changes
            </Button>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card className="fresco-card">
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--text-primary)" }}>
            Security & Password
          </h3>

          {changePasswordSuccess && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert type="success" message="Password changed successfully!" onClose={resetChangePasswordSuccess} />
            </div>
          )}

          {changePasswordError && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert type="error" message={changePasswordError.message} />
            </div>
          )}

          {passwordMismatch && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert type="error" message={passwordMismatch} onClose={() => setPasswordMismatch(null)} />
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" variant="secondary" isLoading={isChangingPassword} style={{ marginTop: "0.5rem" }}>
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
