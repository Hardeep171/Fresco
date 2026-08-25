import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OrdersStackParamList } from "../types/navigation.types";
import { OrderHistoryScreen } from "../screens/orders/OrderHistoryScreen";
import { OrderDetailsScreen } from "../screens/orders/OrderDetailsScreen";
import {
  InspectionReviewScreen,
  InspectionFormScreen,
} from "../screens/inspection";

const Stack = createNativeStackNavigator<OrdersStackParamList>();

/**
 * Orders Stack Navigator for FRESCO Mobile.
 * Hosts Order History list, Order Details, Live Timeline Tracking, Cancellation, and Inspection flows.
 */
export const OrdersNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="OrderHistoryScreen"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="OrderHistoryScreen"
        component={OrderHistoryScreen}
      />
      <Stack.Screen
        name="OrderDetailsScreen"
        component={OrderDetailsScreen}
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

