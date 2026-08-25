import React from "react";
import { StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  PartnerTabParamList,
  PartnerStackParamList,
  PartnerProfileStackParamList,
} from "../types/navigation.types";
import {
  PartnerDashboardScreen,
  AssignmentListScreen,
  AssignmentDetailsScreen,
  DeliveryTaskListScreen,
  DeliveryTaskDetailsScreen,
  PartnerProfileScreen,
} from "../screens/partner";
import {
  InspectionReviewScreen,
  InspectionFormScreen,
} from "../screens/inspection";
import { ThemeSettingsScreen } from "../screens/profile/ThemeSettingsScreen";
import { useTheme, colors, typography, spacing } from "../theme";

const Tab = createBottomTabNavigator<PartnerTabParamList>();
const Stack = createNativeStackNavigator<PartnerStackParamList>();
const ProfileStack = createNativeStackNavigator<PartnerProfileStackParamList>();

const DashboardStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PartnerDashboardScreen"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen
        name="PartnerDashboardScreen"
        component={PartnerDashboardScreen}
      />
      <Stack.Screen
        name="AssignmentListScreen"
        component={AssignmentListScreen}
      />
      <Stack.Screen
        name="AssignmentDetailsScreen"
        component={AssignmentDetailsScreen}
      />
      <Stack.Screen
        name="DeliveryTaskListScreen"
        component={DeliveryTaskListScreen}
      />
      <Stack.Screen
        name="DeliveryTaskDetailsScreen"
        component={DeliveryTaskDetailsScreen}
      />
      <Stack.Screen
        name="InspectionReviewScreen"
        component={InspectionReviewScreen}
      />
      <Stack.Screen
        name="InspectionFormScreen"
        component={InspectionFormScreen}
      />
    </Stack.Navigator>
  );
};


const AssignmentStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AssignmentListScreen"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen
        name="AssignmentListScreen"
        component={AssignmentListScreen}
      />
      <Stack.Screen
        name="AssignmentDetailsScreen"
        component={AssignmentDetailsScreen}
      />
    </Stack.Navigator>
  );
};

const DeliveryTaskStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DeliveryTaskListScreen"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen
        name="DeliveryTaskListScreen"
        component={DeliveryTaskListScreen}
      />
      <Stack.Screen
        name="DeliveryTaskDetailsScreen"
        component={DeliveryTaskDetailsScreen}
      />
    </Stack.Navigator>
  );
};

const PartnerProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      initialRouteName="PartnerProfileScreen"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <ProfileStack.Screen
        name="PartnerProfileScreen"
        component={PartnerProfileScreen}
      />
      <ProfileStack.Screen
        name="ThemeSettingsScreen"
        component={ThemeSettingsScreen}
      />
    </ProfileStack.Navigator>
  );
};

/**
 * Main Delivery Partner Navigator for FRESCO Mobile (Phase 8).
 * Strictly isolated from Customer App flows.
 */
export const PartnerNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="PartnerDashboardTab"
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
        name="PartnerDashboardTab"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "speedometer" : "speedometer-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="PartnerAssignmentsTab"
        component={AssignmentStackNavigator}
        options={{
          tabBarLabel: "Assignments",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="PartnerTasksTab"
        component={DeliveryTaskStackNavigator}
        options={{
          tabBarLabel: "Tasks",
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
        name="PartnerProfileTab"
        component={PartnerProfileStackNavigator}
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
});
