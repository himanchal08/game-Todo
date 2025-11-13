import { StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "../theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
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
  totalXPContainer: {
    alignItems: "flex-end",
  },
  totalXPLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  totalXP: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  dateSection: {
    marginBottom: spacing.lg,
  },
  dateSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.base,
    paddingHorizontal: 5,
  },
  dateHeaderText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  dateTotalText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  xpCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.base,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  sourceIcon: {
    fontSize: 32,
    marginRight: spacing.lg,
  },
  xpInfo: {
    flex: 1,
  },
  xpDescription: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 6,
  },
  xpMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
  },
  sourceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  sourceText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  xpAmountContainer: {
    alignItems: "center",
    marginLeft: spacing.base,
  },
  xpAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  xpLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 40,
    fontSize: typography.fontSize.base,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});
