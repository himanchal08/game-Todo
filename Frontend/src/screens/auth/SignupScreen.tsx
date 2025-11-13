import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { supabase } from "../../services/supabase";
import styles from "../../styles/screens/auth/SignupScreen.styles";

const SignupScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting signup with:", email);

      // Use Supabase Auth for registration
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
            },
          },
        }
      );

      if (signUpError) throw signUpError;

      if (authData.user) {
        console.log("Signup successful:", authData.user.id);

        Alert.alert(
          "Success! 🎉",
          "Account created successfully! You can now login.",
          [
            {
              text: "Go to Login",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;
