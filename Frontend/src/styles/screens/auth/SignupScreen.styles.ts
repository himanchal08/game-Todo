import { StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius } from "../../theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    backgroundColor: colors.backgroundLight,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxxl,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.base,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.base,
    marginTop: spacing.base,
  },
  buttonText: {
    color: colors.textWhite,
    textAlign: "center",
    fontWeight: typography.fontWeight.bold,
  },
  link: {
    marginTop: spacing.lg,
  },
  linkText: {
    color: colors.primary,
    textAlign: "center",
  },
});
