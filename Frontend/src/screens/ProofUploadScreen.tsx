import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { proofsService } from "../services/api";
import { BouncyButton } from "../components/ui";
import { COLORS, SPACING, RADIUS } from "../theme";

const ProofUploadScreen = ({ navigation, route }: any) => {
  const taskId = route?.params?.taskId;
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take proof photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 5],
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library permission is required."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 5],
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    setUploading(true);
    try {
      const data = await proofsService.upload(taskId, image);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Proof Accepted! 🎉",
        `Great job! You earned +${
          data.proof?.xp_bonus || data.xpBonus || 0
        } Bonus XP!`,
        [
          {
            text: "Awesome!",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Upload Failed",
        error.message || "Failed to upload proof. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.fullScreen}>
      {image ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.fullImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.overlay}
          >
            <View style={styles.overlayContent}>
              <Text style={styles.overlayTitle}>Looks great!</Text>
              <View style={styles.row}>
                <BouncyButton
                  style={styles.retakeBtn}
                  onPress={() => setImage(null)}
                >
                  <Ionicons name="refresh" size={24} color="#FFF" />
                </BouncyButton>
                <BouncyButton style={styles.sendBtn} onPress={handleUpload}>
                  {uploading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.sendBtnText}>Submit Proof</Text>
                      <Ionicons name="send" size={20} color="#FFF" />
                    </>
                  )}
                </BouncyButton>
              </View>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.cameraPlaceholder}>
          <Ionicons name="camera-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.placeholderText}>
            Take a photo to prove you did it!
          </Text>
          <View style={styles.buttonContainer}>
            <BouncyButton style={styles.cameraBtn} onPress={pickImage}>
              <Ionicons name="camera" size={24} color="#FFF" />
              <Text style={styles.cameraBtnText}>Open Camera</Text>
            </BouncyButton>
            <BouncyButton style={styles.galleryBtn} onPress={pickFromGallery}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.galleryBtnText}>Choose from Gallery</Text>
            </BouncyButton>
          </View>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtnFloating}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={28} color={image ? "#FFF" : COLORS.text} />
      </TouchableOpacity>
    </View>
  );
};

// ==========================================
// Styles
// ==========================================
const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#000",
  },
  previewContainer: {
    flex: 1,
  },
  fullImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: "flex-end",
    padding: 20,
  },
  overlayContent: {
    paddingBottom: 20,
  },
  overlayTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  retakeBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtn: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.success,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  sendBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  placeholderText: {
    marginTop: 16,
    color: COLORS.textLight,
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 32,
    width: "100%",
    gap: 12,
  },
  cameraBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cameraBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  galleryBtn: {
    backgroundColor: "#FFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  galleryBtnText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtnFloating: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});

export default ProofUploadScreen;
