import React from "react";
import { StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { MainTabParamList } from "../types/navigation.types";
import { CatalogNavigator } from "./CatalogNavigator";
import { OrdersNavigator } from "./OrdersNavigator";
import { CartNavigator } from "./CartNavigator";
import { ProfileNavigator } from "./ProfileNavigator";
import { useCart } from "../hooks/useCart";
import { colors, typography, spacing } from "../theme";

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Authenticated App Main Tab Navigator for FRESCO Mobile.
 * Hosts the Catalog (Phase 5), Orders (Phase 7), Cart/Checkout (Phase 6), and Profile/Address (Phase 4) navigators.
 */
export const AppNavigator: React.FC = () => {
  const { totalItemCount } = useCart();

  return (
    <Tab.Navigator
      initialRouteName="CatalogTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="CatalogTab"
        component={CatalogNavigator}
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
        name="OrdersTab"
        component={OrdersNavigator}
        options={{
          tabBarLabel: "My Orders",
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
        name="CartTab"
        component={CartNavigator}
        options={{
          tabBarLabel: "Cart",
          tabBarBadge: totalItemCount > 0 ? totalItemCount : undefined,
          tabBarBadgeStyle: styles.badgeStyle,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
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
  badgeStyle: {
    backgroundColor: colors.primary,
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: "700",
  },
});
