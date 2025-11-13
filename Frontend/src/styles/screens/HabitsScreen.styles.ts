import { StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "../theme";

export const habitsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },

  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },

  habitList: {
    flex: 1,
  },

  habitCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.base,
  },

  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  habitTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },

  streakBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },

  streakText: {
    color: colors.habitOrange,
    fontWeight: typography.fontWeight.semibold,
  },

  habitDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  habitFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  category: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    backgroundColor: colors.buttonSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },

  bestStreak: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlay,
  },

  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: "90%",
    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    padding: spacing.md,
    marginBottom: spacing.base,
  },

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },

  frequencyOptions: {
    flexDirection: "row",
    marginBottom: spacing.base,
    gap: spacing.sm,
  },

  frequencyButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },

  frequencyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  frequencyText: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },

  frequencyTextActive: {
    color: colors.textWhite,
  },

  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xxxl,
    fontSize: typography.fontSize.md,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modalButton: {
    flex: 1,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    marginHorizontal: spacing.xs,
  },

  cancelButton: {
    backgroundColor: colors.buttonSecondary,
  },

  createButton: {
    backgroundColor: colors.primary,
  },

  cancelButtonText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: typography.fontWeight.semibold,
  },

  createButtonText: {
    color: colors.textWhite,
    textAlign: "center",
    fontWeight: typography.fontWeight.semibold,
  },
});

export default habitsScreenStyles;
