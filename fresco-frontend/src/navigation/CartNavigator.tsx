import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CartStackParamList } from "../types/navigation.types";
import { CartScreen } from "../screens/cart/CartScreen";
import { CheckoutScreen } from "../screens/checkout/CheckoutScreen";
import { OrderReviewScreen } from "../screens/checkout/OrderReviewScreen";
import { OrderSuccessScreen } from "../screens/checkout/OrderSuccessScreen";
import { PaymentScreen } from "../screens/payment/PaymentScreen";

const Stack = createNativeStackNavigator<CartStackParamList>();

/**
 * Cart Stack Navigator for Phase 6 & Phase 10.
 * Hosts Cart, Checkout, Order Review, Order Success, and Payment screens.
 */
export const CartNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CartScreen"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="OrderReviewScreen" component={OrderReviewScreen} />
      <Stack.Screen
        name="OrderSuccessScreen"
        component={OrderSuccessScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
    </Stack.Navigator>
  );
};
