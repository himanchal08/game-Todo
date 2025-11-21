import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { COLORS, SPACING, RADIUS } from "../../theme";

// ==========================================
// Bouncy Button with Haptics
// ==========================================
interface BouncyButtonProps {
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  scale?: number;
}

export const BouncyButton: React.FC<BouncyButtonProps> = ({
  onPress,
  style,
  children,
  scale = 0.95,
}) => {
  const anim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(anim, {
      toValue: scale,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ==========================================
// Gradient Card Component
// ==========================================
interface GradientCardProps {
  colors: string[];
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  colors,
  style,
  children,
}) => (
  <LinearGradient
    colors={colors as any}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.gradientCard, style]}
  >
    {children}
  </LinearGradient>
);

// ==========================================
// Animated Progress Bar
// ==========================================
interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = COLORS.success,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false, // width doesn't support native driver
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [progress]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressBg}>
      <Animated.View
        style={[
          styles.progressFill,
          { width: widthInterpolated, backgroundColor: color },
        ]}
      />
    </View>
  );
};

// ==========================================
// Styles
// ==========================================
const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
  },
  progressBg: {
    height: 8,
    backgroundColor: "rgba(39, 39, 42, 1)", // Zinc 800 for dark theme
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});
