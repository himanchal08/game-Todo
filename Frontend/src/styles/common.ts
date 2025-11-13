/**
 * Common reusable styles
 * Shared components and patterns used across the app
 */

import { StyleSheet } from "react-native";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
} from "./theme";

export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: layout.containerPadding,
  },

  containerCenter: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: layout.containerPadding,
  },

  // Card styles
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: layout.cardPadding,
    marginBottom: spacing.md,
    ...shadows.base,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  // Button styles
  button: {
    padding: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    height: layout.buttonHeight,
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
  },

  buttonSecondary: {
    backgroundColor: colors.buttonSecondary,
  },

  buttonDanger: {
    backgroundColor: colors.buttonDanger,
  },

  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  buttonTextPrimary: {
    color: colors.textWhite,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  buttonTextSecondary: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Input styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    backgroundColor: colors.backgroundLight,
    height: layout.inputHeight,
  },

  inputMultiline: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    backgroundColor: colors.backgroundLight,
    minHeight: 80,
    textAlignVertical: "top",
  },

  // Text styles
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },

  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },

  bodyText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },

  secondaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlay,
  },

  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "90%",
    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
    textAlign: "center",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },

  // Badge/Chip styles
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
  },

  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },

  // List styles
  listContainer: {
    flex: 1,
  },

  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },

  emptyListText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // XP/Points display
  xpBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
  },

  xpText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  // Shadow utilities
  shadowSm: shadows.sm,
  shadowBase: shadows.base,
  shadowMd: shadows.md,
  shadowLg: shadows.lg,

  // Flex utilities
  flexRow: {
    flexDirection: "row",
  },

  flexRowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  flexRowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  flexCenter: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Spacing utilities
  mt4: { marginTop: spacing.xs },
  mt8: { marginTop: spacing.sm },
  mt12: { marginTop: spacing.md },
  mt16: { marginTop: spacing.base },
  mt20: { marginTop: spacing.lg },

  mb4: { marginBottom: spacing.xs },
  mb8: { marginBottom: spacing.sm },
  mb12: { marginBottom: spacing.md },
  mb16: { marginBottom: spacing.base },
  mb20: { marginBottom: spacing.lg },

  p16: { padding: spacing.base },
  p20: { padding: spacing.lg },
});

export default commonStyles;
