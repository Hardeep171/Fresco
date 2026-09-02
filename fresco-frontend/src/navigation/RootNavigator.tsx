import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation.types";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { PartnerNavigator } from "./PartnerNavigator";
import { AdminNavigator } from "./AdminNavigator";
import { SplashScreen } from "../screens/auth/SplashScreen";
import { useAuth } from "../hooks/useAuth";
import { useTheme, createNavigationTheme } from "../theme";
import { ADMIN_ROLES } from "../constants/user.constants";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isAuthenticated, isRestoringToken } = useAuth();
  const { theme } = useTheme();
  const navTheme = createNavigationTheme(theme);

  const isAdmin = Boolean(
    user?.role && (ADMIN_ROLES as readonly string[]).includes(user.role)
  );
  const isDeliveryPartner = user?.role === "DELIVERY_PARTNER";

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isRestoringToken ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : isAdmin ? (
          <Stack.Screen name="AdminApp" component={AdminNavigator} />
        ) : isDeliveryPartner ? (
          <Stack.Screen name="PartnerApp" component={PartnerNavigator} />
        ) : (
          <Stack.Screen name="App" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

