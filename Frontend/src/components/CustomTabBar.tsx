/**
 * Custom Floating Tab Bar Component - Orbit Design
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "../theme";

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const getIconName = (routeName: string): any => {
    const iconMap: Record<string, string> = {
      Dashboard: "home",
      Habits: "repeat",
      Create: "add",
      Analytics: "bar-chart",
      Profile: "person",
    };
    return iconMap[routeName] || "ellipse";
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCreate = route.name === "Create";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
              Haptics.selectionAsync();
            }
          };

          const iconName = getIconName(route.name);

          if (isCreate) {
            return (
              <View key={index} style={styles.createButtonContainer}>
                <TouchableOpacity
                  onPress={onPress}
                  style={styles.createButton}
                  activeOpacity={0.9}
                >
                  <Ionicons name="add" size={32} color="#000" />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? "#FFF" : COLORS.textLight}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
    paddingTop: 10,
    backgroundColor: "rgba(9, 9, 11, 0.95)", // Zinc 950 with opacity
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  createButtonContainer: {
    top: -25,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default CustomTabBar;
