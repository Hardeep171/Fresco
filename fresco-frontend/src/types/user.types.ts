export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface AdminStats {
  totalCustomers: number;
  totalPartners: number;
  activeCustomers: number;
  activePartners: number;
  totalOrders: number;
  pendingOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

