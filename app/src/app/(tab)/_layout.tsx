import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTheme } from "@/hooks/use-theme";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route);
        const hideTabBar = routeName !== undefined && routeName !== "index";
        return {
          headerShown: false,
          tabBarStyle: {
            display: hideTabBar ? "none" : "flex",
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.cardBorder,
            height: 75,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: theme.secondary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 2,
          },
        };
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" color={color} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color }) => (
            <Feather name="play-circle" color={color} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => (
            <Feather name="trending-up" color={color} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" color={color} size={20} />
          ),
        }}
      />
    </Tabs>
  );
}
