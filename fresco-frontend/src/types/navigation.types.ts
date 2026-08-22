import { NavigatorScreenParams } from "@react-navigation/native";
import { Order } from "./order.types";

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<MainTabParamList> | NavigatorScreenParams<ProfileStackParamList> | undefined;
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

export type CartStackParamList = {
  CartScreen: undefined;
  CheckoutScreen: undefined;
  OrderReviewScreen: undefined;
  OrderSuccessScreen: { order: Order };
};

export type OrdersStackParamList = {
  OrderHistoryScreen: undefined;
  OrderDetailsScreen: { orderId: string };
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
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CatalogTab: NavigatorScreenParams<CatalogStackParamList>;
  CartTab: NavigatorScreenParams<CartStackParamList>;
  OrdersTab: NavigatorScreenParams<OrdersStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
