import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useUser } from "../../hooks/useUser";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Alert } from "../../components/common/Alert";

export const ProfilePage: React.FC = () => {
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

    if (newPassword.length < 8) {
      setPasswordMismatch("New password must be at least 8 characters long.");
      return;
    }

    const success = await changePassword({
      currentPassword,
      newPassword,
    });

    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Account & Security
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Manage your personal details and account credentials
        </p>
      </div>

      {updateSuccess && (
        <Alert
          type="success"
          message="Profile updated successfully."
          onClose={resetUpdateSuccess}
        />
      )}

      {updateError && (
        <Alert
          type="error"
          message={updateError.message || "Failed to update profile."}
        />
      )}

      {changePasswordSuccess && (
        <Alert
          type="success"
          message="Password changed successfully."
          onClose={resetChangePasswordSuccess}
        />
      )}

      {(passwordMismatch || changePasswordError) && (
        <Alert
          type="error"
          message={passwordMismatch || changePasswordError?.message || "Failed to change password."}
          onClose={() => setPasswordMismatch(null)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Profile Information */}
        <Card title="Personal Information">
          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                leftIcon={<User size={18} />}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                leftIcon={<User size={18} />}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Input
                label="Email Address"
                value={profile?.email || user?.email || ""}
                disabled
                helperText="Email address cannot be modified."
                leftIcon={<Mail size={18} />}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone size={18} />}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdating}
                leftIcon={<CheckCircle size={18} />}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password */}
        <Card title="Change Password" subtitle="Ensure you use a strong password with at least 8 characters">
          <form onSubmit={handleChangePassword}>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              leftIcon={<Lock size={18} />}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Input
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <Button
                type="submit"
                variant="secondary"
                isLoading={isChangingPassword}
                leftIcon={<Shield size={18} />}
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
