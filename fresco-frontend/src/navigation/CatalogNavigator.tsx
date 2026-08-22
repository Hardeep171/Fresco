import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CatalogStackParamList } from "../types/navigation.types";
import { CatalogScreen } from "../screens/catalog/CatalogScreen";
import { GarmentListScreen } from "../screens/catalog/GarmentListScreen";
import { GarmentDetailScreen } from "../screens/catalog/GarmentDetailScreen";

const Stack = createNativeStackNavigator<CatalogStackParamList>();

/**
 * Catalog Stack Navigator for Phase 5.
 * Hosts Category browsing, Garment listing, and Garment detail/service selection screens.
 */
export const CatalogNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CatalogScreen"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="CatalogScreen" component={CatalogScreen} />
      <Stack.Screen name="GarmentListScreen" component={GarmentListScreen} />
      <Stack.Screen
        name="GarmentDetailScreen"
        component={GarmentDetailScreen}
      />
    </Stack.Navigator>
  );
};
