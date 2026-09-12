import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import { AuthLayout } from "../layouts/AuthLayout";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { PartnerLayout } from "../layouts/PartnerLayout";
import { ProtectedRoute } from "./ProtectedRoute";

// Auth Pages
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";

// Customer Pages
import { CatalogPage } from "../pages/customer/CatalogPage";
import { CartPage } from "../pages/customer/CartPage";
import { CheckoutPage } from "../pages/customer/CheckoutPage";
import { OrdersPage } from "../pages/customer/OrdersPage";
import { OrderDetailsPage } from "../pages/customer/OrderDetailsPage";
import { AddressesPage } from "../pages/customer/AddressesPage";
import { ProfilePage } from "../pages/customer/ProfilePage";

// Admin Pages
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage";
import { AdminOrderDetailsPage } from "../pages/admin/AdminOrderDetailsPage";
import { AdminCatalogPage } from "../pages/admin/AdminCatalogPage";
import { AdminPricingPage } from "../pages/admin/AdminPricingPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminInspectionPage } from "../pages/admin/AdminInspectionPage";
import { AdminPaymentsPage } from "../pages/admin/AdminPaymentsPage";

// Partner Pages
import { PartnerDashboardPage } from "../pages/partner/PartnerDashboardPage";
import { PartnerHistoryPage } from "../pages/partner/PartnerHistoryPage";
import { PartnerProfilePage } from "../pages/partner/PartnerProfilePage";

// Common Pages
import { NotFoundPage } from "../pages/common/NotFoundPage";

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Customer Protected Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/addresses" element={<AddressesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
          <Route path="catalog" element={<AdminCatalogPage />} />
          <Route path="pricing" element={<AdminPricingPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="inspections" element={<AdminInspectionPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
        </Route>

        {/* Delivery Partner Protected Routes */}
        <Route
          path="/partner"
          element={
            <ProtectedRoute allowedRoles={["DELIVERY_PARTNER"]}>
              <PartnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/partner/tasks" replace />} />
          <Route path="tasks" element={<PartnerDashboardPage />} />
          <Route path="history" element={<PartnerHistoryPage />} />
          <Route path="profile" element={<PartnerProfilePage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
