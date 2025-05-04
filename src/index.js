import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./components/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./config/queryClient";
import { AuthProvider } from "../src/contexts/authContext";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar
            barStyle={"dark-content"}
            translucent
            backgroundColor="transparent"
          />
          <StackNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}
