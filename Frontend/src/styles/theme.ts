/**
 * Theme configuration
 * Centralized colors, typography, spacing, and other design tokens
 */

export const colors = {
  // Primary colors
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primaryLight: "#60A5FA",

  // Background colors
  background: "#f5f5f5",
  backgroundLight: "#ffffff",
  backgroundDark: "#1F2937",

  // Text colors
  text: "#000000",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  textWhite: "#ffffff",

  // Status colors
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",

  // UI colors
  border: "#E5E7EB",
  borderDark: "#D1D5DB",
  card: "#ffffff",
  shadow: "#000000",

  // Button colors
  button: "#3B82F6",
  buttonSecondary: "#F3F4F6",
  buttonDanger: "#EF4444",

  // Habit/Badge colors
  habitBlue: "#3B82F6",
  habitGreen: "#10B981",
  habitPurple: "#8B5CF6",
  habitOrange: "#F59E0B",
  habitRed: "#EF4444",
  habitPink: "#EC4899",

  // Opacity overlays
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
};

export const typography = {
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
  },

  // Font weights
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const layout = {
  containerPadding: spacing.lg,
  screenPadding: spacing.lg,
  cardPadding: spacing.base,
  buttonHeight: 50,
  inputHeight: 50,
  iconSize: 24,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
};
