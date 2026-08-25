import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation.types";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { PartnerNavigator } from "./PartnerNavigator";
import { SplashScreen } from "../screens/auth/SplashScreen";
import { useAuth } from "../hooks/useAuth";
import { useTheme, createNavigationTheme } from "../theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isAuthenticated, isRestoringToken } = useAuth();
  const { theme } = useTheme();
  const isDeliveryPartner = user?.role === "DELIVERY_PARTNER";
  const navTheme = createNavigationTheme(theme);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isRestoringToken ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : isDeliveryPartner ? (
          <Stack.Screen name="PartnerApp" component={PartnerNavigator} />
        ) : (
          <Stack.Screen name="App" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

