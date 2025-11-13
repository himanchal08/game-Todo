import { StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "../theme";

export const tasksScreenStyles = StyleSheet.create({
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

  taskList: {
    flex: 1,
  },

  dateHeader: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginVertical: spacing.sm,
    color: colors.textSecondary,
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

  completedText: {
    textDecorationLine: "line-through",
    color: colors.textLight,
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

  completedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },

  completedBadgeText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xxxl,
    fontSize: typography.fontSize.md,
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
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    fontSize: typography.fontSize.md,
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

  habitsList: {
    maxHeight: 150,
    marginBottom: spacing.base,
  },

  habitOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  habitOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EFF6FF",
  },

  habitOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },

  habitOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },

  button: {
    flex: 1,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: colors.buttonSecondary,
    marginRight: spacing.sm,
  },

  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  createButton: {
    backgroundColor: colors.primary,
  },

  createButtonText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Proof photo modal styles
  proofModalContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "90%",
    maxHeight: "80%",
  },

  proofNote: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 18,
  },

  imagePreviewContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: borderRadius.lg,
    resizeMode: "cover",
  },

  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },

  removeImageText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  photoOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
  },

  photoButton: {
    backgroundColor: colors.buttonSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    width: "45%",
    borderWidth: 2,
    borderColor: colors.border,
  },

  photoButtonIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },

  photoButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },

  disabledButton: {
    backgroundColor: colors.textLight,
    opacity: 0.6,
  },
});

export default tasksScreenStyles;
