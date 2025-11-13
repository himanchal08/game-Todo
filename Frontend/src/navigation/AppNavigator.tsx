import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

// Import screens
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import HabitsScreen from "../screens/HabitsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TasksScreen from "../screens/TasksScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import BadgesScreen from "../screens/BadgesScreen";
import XPHistoryScreen from "../screens/XPHistoryScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="checkbox-marked"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="repeat" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="MainApp" component={TabNavigator} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ headerShown: true, title: "Notifications" }}
            />
            <Stack.Screen
              name="Badges"
              component={BadgesScreen}
              options={{ headerShown: true, title: "Badges" }}
            />
            <Stack.Screen
              name="XPHistory"
              component={XPHistoryScreen}
              options={{ headerShown: true, title: "XP History" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
