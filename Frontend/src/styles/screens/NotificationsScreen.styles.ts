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
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.base,
  },
  badgeText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  markAllButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.base,
    alignSelf: "flex-end",
    marginBottom: spacing.md,
  },
  markAllButtonText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  list: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  unreadCard: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    fontSize: typography.fontSize.xxl,
    marginRight: spacing.lg,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  unreadTitle: {
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
  },
  notificationMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  notificationDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.textLight,
  },
  unreadIndicator: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
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
