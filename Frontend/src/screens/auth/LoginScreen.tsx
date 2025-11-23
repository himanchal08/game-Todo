import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import { COLORS, SPACING, RADIUS } from "../../theme";

const { width } = Dimensions.get("window");

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting login with:", email);

      // Use Supabase Auth for authentication (this is necessary for session management)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("Login error:", error);
        throw error;
      }

      if (data.session) {
        console.log("Login successful:", data.user?.id);
        Alert.alert("Success", "Welcome back! 🎉");
        // Navigation will be handled automatically by AuthContext
      }
    } catch (error: any) {
      console.log("Login error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/Disciplo_Logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Disciplo</Text>
          <Text style={styles.subtitle}>Build Your Legacy</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.description}>Login to continue your journey</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={COLORS.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                loading
                  ? [COLORS.backgroundTertiary, COLORS.backgroundTertiary]
                  : [COLORS.primary, "#8B5CF6"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {loading ? (
                <Text style={styles.buttonText}>Loading...</Text>
              ) : (
                <>
                  <Text style={styles.buttonText}>Login</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("Signup")}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              Don't have an account?{" "}
              <Text style={styles.linkTextBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.l,
    paddingTop: SPACING.xl * 3,
    paddingBottom: SPACING.xl * 2,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl * 2,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: SPACING.m,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.m,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: SPACING.m,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: SPACING.m,
  },
  button: {
    marginTop: SPACING.l,
    borderRadius: RADIUS.m,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.m + 2,
    gap: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  link: {
    marginTop: SPACING.xl,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  linkTextBold: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default LoginScreen;
