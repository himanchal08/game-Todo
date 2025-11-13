import { StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "../theme";

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  profileCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },

  welcomeText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },

  levelContainer: {
    alignItems: "center",
  },

  levelText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },

  xpText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },

  taskList: {
    flex: 1,
  },

  taskCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.base,
  },

  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },

  taskTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },

  xpReward: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  taskDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: 5,
  },

  habitName: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },

  completedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },

  completedText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});

export default homeScreenStyles;
