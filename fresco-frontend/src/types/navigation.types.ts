import { NavigatorScreenParams } from "@react-navigation/native";
import { Order } from "./order.types";

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<MainTabParamList> | undefined;
  PartnerApp: NavigatorScreenParams<PartnerTabParamList> | undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
  VerifyEmail: { token?: string };
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  CategoryDetailScreen: { categoryId: string; categoryName: string };
};

export type CatalogStackParamList = {
  CatalogScreen: { selectedCategoryId?: string } | undefined;
  GarmentListScreen: { categoryId: string; categoryName: string };
  GarmentDetailScreen: { garmentId: string; garmentName: string };
};

import { PaymentMethod } from "../constants/payment.constants";

export type CartStackParamList = {
  CartScreen: undefined;
  CheckoutScreen: undefined;
  OrderReviewScreen: undefined;
  OrderSuccessScreen: { order: Order };
  PaymentScreen: { orderId: string; initialPaymentMethod?: PaymentMethod };
};

export type OrdersStackParamList = {
  OrderHistoryScreen: undefined;
  OrderDetailsScreen: { orderId: string };
  PaymentScreen: { orderId: string; initialPaymentMethod?: PaymentMethod };
  InspectionReviewScreen: { orderId: string; inspectionId?: string };
  InspectionFormScreen: { orderId: string; inspectionId?: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  AddressListScreen: undefined;
  AddAddressScreen: undefined;
  EditAddressScreen: { addressId: string };
  AddEditAddressScreen?: { addressId?: string };
  ChangePasswordScreen: undefined;
  PaymentHistoryScreen?: undefined;
  ThemeSettingsScreen: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CatalogTab: NavigatorScreenParams<CatalogStackParamList>;
  CartTab: NavigatorScreenParams<CartStackParamList>;
  OrdersTab: NavigatorScreenParams<OrdersStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ==========================================
// PHASE 8: DELIVERY PARTNER NAVIGATION TYPES
// ==========================================

export type PartnerStackParamList = {
  PartnerDashboardScreen: undefined;
  AssignmentListScreen: { initialFilter?: string } | undefined;
  AssignmentDetailsScreen: { assignmentId: string };
  DeliveryTaskListScreen: { initialFilter?: string } | undefined;
  DeliveryTaskDetailsScreen: { taskId: string };
  InspectionReviewScreen: { orderId: string; inspectionId?: string };
  InspectionFormScreen: { orderId: string; inspectionId?: string };
};


export type PartnerProfileStackParamList = {
  PartnerProfileScreen: undefined;
  ThemeSettingsScreen?: undefined;
};

export type PartnerTabParamList = {
  PartnerDashboardTab: NavigatorScreenParams<PartnerStackParamList>;
  PartnerAssignmentsTab: NavigatorScreenParams<PartnerStackParamList>;
  PartnerTasksTab: NavigatorScreenParams<PartnerStackParamList>;
  PartnerProfileTab: NavigatorScreenParams<PartnerProfileStackParamList>;
};

