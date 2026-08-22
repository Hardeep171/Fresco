/**
 * Screen and Navigator route name constants.
 */

export const ROUTES = {
  // Root / Auth
  SPLASH: "Splash",
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword",
  RESET_PASSWORD: "ResetPassword",
  VERIFY_EMAIL: "VerifyEmail",

  // Main Tabs
  MAIN_TABS: "MainTabs",
  HOME_TAB: "HomeTab",
  CATALOG_TAB: "CatalogTab",
  CART_TAB: "CartTab",
  ORDERS_TAB: "OrdersTab",
  PROFILE_TAB: "ProfileTab",

  // Home Stack
  HOME: "HomeScreen",
  CATEGORY_DETAIL: "CategoryDetailScreen",

  // Catalog Stack
  CATALOG: "CatalogScreen",
  GARMENT_LIST: "GarmentListScreen",
  GARMENT_DETAIL: "GarmentDetailScreen",

  // Cart Stack
  CART: "CartScreen",
  CHECKOUT: "CheckoutScreen",
  ORDER_REVIEW: "OrderReviewScreen",
  ORDER_SUCCESS: "OrderSuccessScreen",
  ORDER_CONFIRMATION: "OrderConfirmationScreen",

  // Orders Stack
  ORDERS_LIST: "OrdersListScreen",
  ORDER_DETAIL: "OrderDetailScreen",
  ORDER_TRACKING: "OrderTrackingScreen",

  // Profile Stack
  PROFILE: "ProfileScreen",
  EDIT_PROFILE: "EditProfileScreen",
  ADDRESS_LIST: "AddressListScreen",
  ADD_ADDRESS: "AddAddressScreen",
  EDIT_ADDRESS: "EditAddressScreen",
  ADD_EDIT_ADDRESS: "AddEditAddressScreen",
  CHANGE_PASSWORD: "ChangePasswordScreen",

  // Modals
  INSPECTION_MODAL: "InspectionModal",
  PAYMENT_MODAL: "PaymentModal",
} as const;
