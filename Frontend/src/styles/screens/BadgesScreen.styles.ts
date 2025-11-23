import { StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "../theme";

export const badgesScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    backgroundColor: "transparent",
  },

  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },

  statsContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
  },

  statsText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  filterContainer: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },

  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.base,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
  },

  filterButtonActive: {
    backgroundColor: colors.primary,
  },

  filterText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },

  filterTextActive: {
    color: colors.textWhite,
  },

  list: {
    flex: 1,
  },

  badgeCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    ...shadows.base,
  },

  lockedBadge: {
    opacity: 0.6,
  },

  badgeIcon: {
    fontSize: 48,
    marginRight: spacing.base,
  },

  lockedIcon: {
    filter: "grayscale(100%)",
    opacity: 0.5,
  },

  badgeInfo: {
    flex: 1,
  },

  badgeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  lockedText: {
    color: colors.textLight,
  },

  badgeDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  badgeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },

  categoryText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },

  earnedDate: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },

  requirementText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },

  earnedIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
  },

  lockedIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  lockedIndicatorText: {
    fontSize: typography.fontSize.md,
  },

  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xxxl,
    fontSize: typography.fontSize.md,
  },

  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});

export default badgesScreenStyles;
