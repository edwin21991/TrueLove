// app/index.js
import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox } from "react-native";
import { registerForPushNotificationsAsync } from "../utils/notifications";

// 🖥️ Pantallas
import HomeScreen from "../screens/HomeScreen";
import GroupScreen from "../screens/GroupScreen";
import SectionScreen from "../screens/SectionScreen";
import QRScreen from "../screens/QRScreen"; // ✅ Pantalla de prueba simple

LogBox.ignoreAllLogs(true);
const Stack = createNativeStackNavigator();

export default function Index() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Group" component={GroupScreen} />
        <Stack.Screen name="Section" component={SectionScreen} />
        <Stack.Screen name="QR" component={QRScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
