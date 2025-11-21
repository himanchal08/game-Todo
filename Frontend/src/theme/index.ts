export const COLORS = {
  // Modern Dark Theme (Zinc-based)
  primary: "#6366F1", // Indigo
  secondary: "#EC4899", // Pink
  success: "#10B981", // Emerald
  warning: "#F59E0B", // Amber
  danger: "#EF4444", // Red

  // Background colors - Dark theme
  background: "#09090B", // Zinc 950
  backgroundSecondary: "#18181B", // Zinc 900
  backgroundTertiary: "#27272A", // Zinc 800

  // Card colors with transparency
  card: "#18181B", // Zinc 900
  cardGlass: "rgba(24, 24, 27, 0.6)", // Glass effect
  cardBorder: "rgba(255, 255, 255, 0.05)",

  // Text colors
  text: "#FAFAFA", // Zinc 50
  textSecondary: "#D4D4D8", // Zinc 300
  textMuted: "#A1A1AA", // Zinc 400
  textLight: "#71717A", // Zinc 500

  // Border colors
  border: "rgba(255, 255, 255, 0.05)",
  borderStrong: "rgba(255, 255, 255, 0.1)",

  // Status colors with dark theme support
  successLight: "#10B981",
  successDark: "#059669",
  warningLight: "#F59E0B",
  warningDark: "#D97706",

  // Special colors
  fireOrange: "#F97316", // Streak flame
  indigo: "#6366F1",
  purple: "#A855F7",

  // Gradients
  gradients: {
    primary: ["#6366F1", "#8B5CF6"], // Indigo to Purple
    gold: ["#F59E0B", "#D97706"], // Amber gradient
    fire: ["#F97316", "#EF4444"], // Orange to Red
    success: ["#10B981", "#059669"], // Emerald gradient
    glass: ["rgba(24, 24, 27, 0.8)", "rgba(24, 24, 27, 0.4)"], // Glass effect
  },
};

export const SPACING = {
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const RADIUS = {
  s: 8,
  m: 16,
  l: 24,
  xl: 30,
};

// Export default for convenience
export default {
  COLORS,
  SPACING,
  RADIUS,
};
