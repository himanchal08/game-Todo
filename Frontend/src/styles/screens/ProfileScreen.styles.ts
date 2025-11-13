import { StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "../theme";

export const profileScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
  },

  profileInfo: {
    alignItems: "center",
  },

  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },

  username: {
    fontSize: typography.fontSize.md,
    color: colors.border,
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: spacing.lg,
    marginTop: -30,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },

  actionButton: {
    backgroundColor: colors.backgroundLight,
    flex: 1,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.md,
  },

  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },

  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },

  statsCard: {
    backgroundColor: colors.backgroundLight,
    margin: spacing.lg,
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    ...shadows.md,
  },

  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: spacing.base,
  },

  statItem: {
    alignItems: "center",
    minWidth: "30%",
  },

  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  statLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  centerText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xxxl,
  },

  section: {
    margin: spacing.lg,
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },

  streakCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.habitOrange,
    ...shadows.base,
  },

  streakInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },

  habitTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },

  streakCount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.habitOrange,
  },

  bestStreak: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  logoutButton: {
    backgroundColor: colors.buttonDanger,
    margin: spacing.lg,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    alignItems: "center",
  },

  logoutText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default profileScreenStyles;
