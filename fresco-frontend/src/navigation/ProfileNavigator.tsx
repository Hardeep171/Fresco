import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../types/navigation.types";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { EditProfileScreen } from "../screens/profile/EditProfileScreen";
import { ChangePasswordScreen } from "../screens/profile/ChangePasswordScreen";
import { AddressListScreen } from "../screens/address/AddressListScreen";
import { AddAddressScreen } from "../screens/address/AddAddressScreen";
import { EditAddressScreen } from "../screens/address/EditAddressScreen";
import { ThemeSettingsScreen } from "../screens/profile/ThemeSettingsScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/**
 * Profile Stack Navigator hosting Profile and Address Book screens.
 */
export const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
      />
      <Stack.Screen name="AddressListScreen" component={AddressListScreen} />
      <Stack.Screen name="AddAddressScreen" component={AddAddressScreen} />
      <Stack.Screen name="EditAddressScreen" component={EditAddressScreen} />
      <Stack.Screen
        name="ThemeSettingsScreen"
        component={ThemeSettingsScreen}
      />
    </Stack.Navigator>
  );
};
