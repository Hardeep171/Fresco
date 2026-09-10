import React from "react";
import { StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  AdminTabParamList,
  AdminStackParamList,
  AdminOrdersStackParamList,
  AdminCatalogStackParamList,
  AdminAssignmentsStackParamList,
  AdminProfileStackParamList,
} from "../types/navigation.types";
import {
  AdminDashboardScreen,
  AdminProfileScreen,
  AdminCatalogScreen,
  AdminCategoriesScreen,
  AdminGarmentsScreen,
  AdminServicesScreen,
  AdminPricingScreen,
  AdminCustomersScreen,
  AdminPartnersScreen,
} from "../screens/admin";
import { OrderHistoryScreen, OrderDetailsScreen } from "../screens/orders";
import {
  AssignmentListScreen,
  AssignmentDetailsScreen,
  DeliveryTaskDetailsScreen,
} from "../screens/partner";
import {
  InspectionReviewScreen,
  InspectionFormScreen,
} from "../screens/inspection";
import { ThemeSettingsScreen } from "../screens/profile/ThemeSettingsScreen";
import { useTheme, colors, typography, spacing } from "../theme";

const Tab = createBottomTabNavigator<AdminTabParamList>();
const DashboardStack = createNativeStackNavigator<AdminStackParamList>();
const OrdersStack = createNativeStackNavigator<AdminOrdersStackParamList>();
const CatalogStack = createNativeStackNavigator<AdminCatalogStackParamList>();
const AssignmentsStack = createNativeStackNavigator<AdminAssignmentsStackParamList>();
const ProfileStack = createNativeStackNavigator<AdminProfileStackParamList>();

const DashboardStackNavigator: React.FC = () => {
  return (
    <DashboardStack.Navigator
      initialRouteName="AdminDashboardScreen"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <DashboardStack.Screen
        name="AdminDashboardScreen"
        component={AdminDashboardScreen}
      />
      <DashboardStack.Screen
        name="OrderDetailsScreen"
        component={OrderDetailsScreen}
      />
      <DashboardStack.Screen
        name="AssignmentDetailsScreen"
        component={AssignmentDetailsScreen}
      />
      <DashboardStack.Screen
        name="DeliveryTaskDetailsScreen"
        component={DeliveryTaskDetailsScreen}
      />
      <DashboardStack.Screen
        name="InspectionReviewScreen"
        component={InspectionReviewScreen}
      />
      <DashboardStack.Screen
        name="InspectionFormScreen"
        component={InspectionFormScreen}
      />
      <DashboardStack.Screen
        name="AdminCatalogScreen"
        component={AdminCatalogScreen}
      />
      <DashboardStack.Screen
        name="AdminCategoriesScreen"
        component={AdminCategoriesScreen}
      />
      <DashboardStack.Screen
        name="AdminGarmentsScreen"
        component={AdminGarmentsScreen}
      />
      <DashboardStack.Screen
        name="AdminServicesScreen"
        component={AdminServicesScreen}
      />
      <DashboardStack.Screen
        name="AdminPricingScreen"
        component={AdminPricingScreen}
      />
      <DashboardStack.Screen
        name="AdminCustomersScreen"
        component={AdminCustomersScreen}
      />
      <DashboardStack.Screen
        name="AdminPartnersScreen"
        component={AdminPartnersScreen}
      />
    </DashboardStack.Navigator>
  );
};

const OrdersStackNavigator: React.FC = () => {
  return (
    <OrdersStack.Navigator
      initialRouteName="OrderHistoryScreen"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <OrdersStack.Screen
        name="OrderHistoryScreen"
        component={OrderHistoryScreen}
      />
      <OrdersStack.Screen
        name="OrderDetailsScreen"
        component={OrderDetailsScreen}
      />
      <OrdersStack.Screen
        name="InspectionReviewScreen"
        component={InspectionReviewScreen}
      />
      <OrdersStack.Screen
        name="InspectionFormScreen"
        component={InspectionFormScreen}
      />
    </OrdersStack.Navigator>
  );
};

const CatalogStackNavigator: React.FC = () => {
  return (
    <CatalogStack.Navigator
      initialRouteName="AdminCatalogScreen"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <CatalogStack.Screen
        name="AdminCatalogScreen"
        component={AdminCatalogScreen}
      />
      <CatalogStack.Screen
        name="AdminCategoriesScreen"
        component={AdminCategoriesScreen}
      />
      <CatalogStack.Screen
        name="AdminGarmentsScreen"
        component={AdminGarmentsScreen}
      />
      <CatalogStack.Screen
        name="AdminServicesScreen"
        component={AdminServicesScreen}
      />
      <CatalogStack.Screen
        name="AdminPricingScreen"
        component={AdminPricingScreen}
      />
    </CatalogStack.Navigator>
  );
};

const AssignmentsStackNavigator: React.FC = () => {
  return (
    <AssignmentsStack.Navigator
      initialRouteName="AssignmentListScreen"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <AssignmentsStack.Screen
        name="AssignmentListScreen"
        component={AssignmentListScreen}
      />
      <AssignmentsStack.Screen
        name="AssignmentDetailsScreen"
        component={AssignmentDetailsScreen}
      />
      <AssignmentsStack.Screen
        name="DeliveryTaskDetailsScreen"
        component={DeliveryTaskDetailsScreen}
      />
    </AssignmentsStack.Navigator>
  );
};

const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      initialRouteName="AdminProfileScreen"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <ProfileStack.Screen
        name="AdminProfileScreen"
        component={AdminProfileScreen}
      />
      <ProfileStack.Screen
        name="ThemeSettingsScreen"
        component={ThemeSettingsScreen}
      />
    </ProfileStack.Navigator>
  );
};

/**
 * Main Admin Operations Navigator for FRESCO Mobile.
 * Strictly isolated from Customer and Delivery Partner flows.
 */
export const AdminNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="AdminDashboardTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.tabBarBorder,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminOrdersTab"
        component={OrdersStackNavigator}
        options={{
          tabBarLabel: "Orders",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminCatalogTab"
        component={CatalogStackNavigator}
        options={{
          tabBarLabel: "Catalog",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "shirt" : "shirt-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminAssignmentsTab"
        component={AssignmentsStackNavigator}
        options={{
          tabBarLabel: "Dispatches",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bicycle" : "bicycle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "shield-checkmark" : "shield-checkmark-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};


const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 88 : 64,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === "ios" ? spacing.lg : spacing.xs,
  },
  tabBarLabel: {
    ...typography.presets.label,
    fontSize: 11,
    marginTop: spacing.xxs,
  },
  tabBarItem: {
    paddingVertical: spacing.xxs,
  },
});
