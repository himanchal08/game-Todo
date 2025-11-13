import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import api from "../services/api";
import styles from "../styles/screens/TasksScreen.styles";

interface Task {
  id: string;
  title: string;
  description: string;
  scheduled_for: string;
  completed: boolean;
  xp_reward: number;
  habit_id?: string; // Optional - tasks can be standalone or under habits
}

interface Habit {
  id: string;
  name: string;
  frequency: string;
}

const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    habitId: "",
    scheduledFor: new Date().toISOString().split("T")[0],
    xpReward: "50",
  });

  const fetchTasks = async () => {
    try {
      const response = await api.tasks.getTodayTasks();
      setTasks(response.tasks || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", error.message || "Failed to fetch tasks");
    }
  };

  const fetchHabits = async () => {
    try {
      const response = await api.habits.getAll();
      setHabits(response.habits || []);
    } catch (error: any) {
      console.error("Error fetching habits:", error);
      Alert.alert("Error", error.message || "Failed to fetch habits");
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    // Habit is optional - users can create standalone tasks or tasks under habits

    try {
      const taskData: any = {
        title: newTask.title,
        description: newTask.description,
        xp_reward: parseInt(newTask.xpReward) || 50,
        scheduled_for: newTask.scheduledFor,
      };

      // Only include habit_id if a habit is selected
      if (newTask.habitId) {
        taskData.habit_id = newTask.habitId;
      }

      await api.tasks.create(taskData);

      setModalVisible(false);
      setNewTask({
        title: "",
        description: "",
        habitId: "",
        scheduledFor: new Date().toISOString().split("T")[0],
        xpReward: "50",
      });

      await fetchTasks();
      Alert.alert("Success", "Task created successfully! ");
    } catch (error: any) {
      console.error("Error creating task:", error);
      Alert.alert("Error", error.message || "Failed to create task");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    // Photo verification is mandatory for task completion
    Alert.alert(
      "Complete Task",
      "Please add a proof photo to complete this task. This helps verify your progress!",
      [
        {
          text: "OK",
          onPress: () => {
            setSelectedTaskId(taskId);
            setProofModalVisible(true);
          },
        },
      ]
    );
  };

  // Photo verification is now mandatory, so this function is no longer used
  // const completeTaskWithoutProof = async (taskId: string) => {
  //   try {
  //     const response = await api.tasks.complete(taskId);
  //     let message = `+${response.xpAwarded} XP earned!`;
  //     if (response.newLevel) {
  //       message += `\n🎉 Level Up! You're now level ${response.newLevel}!`;
  //     }
  //     if (response.newBadges && response.newBadges.length > 0) {
  //       message += `\n🏆 New Badge: ${response.newBadges
  //         .map((b: any) => b.name)
  //         .join(", ")}`;
  //     }
  //     Alert.alert("Task Completed! ✅", message);
  //     await fetchTasks();
  //   } catch (error: any) {
  //     console.error("Error completing task:", error);
  //     Alert.alert("Error", error.message || "Failed to complete task");
  //   }
  // };

  const requestPermissions = async () => {
    try {
      // Request camera permission
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to take photos"
        );
        return false;
      }

      // Request media library permission (for saving photos)
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Storage permission is needed to save your proof photos to your device. " +
            "Photos will be stored locally and deleted from our server after 90 minutes.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Grant Permission",
              onPress: async () => {
                await MediaLibrary.requestPermissionsAsync();
              },
            },
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const savePhotoToDevice = async (localUri: string) => {
    try {
      // Save the captured/picked photo to gallery in a dedicated album
      const { status } = await MediaLibrary.getPermissionsAsync();
      if (status !== "granted") {
        // Photo is already on device from camera/picker, just notify user
        console.log(
          "Media library permission not granted, photo already on device"
        );
        return;
      }

      // Create asset from the local URI (photo is already on device)
      const asset = await MediaLibrary.createAssetAsync(localUri);

      // Try to create/get the "Task Proofs" album and add the photo
      try {
        const album = await MediaLibrary.getAlbumAsync("Task Proofs");
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync("Task Proofs", asset, false);
        }
      } catch (albumError) {
        // Album operations failed, but photo is still saved to device
        console.log(
          "Album operation failed, photo still on device:",
          albumError
        );
      }

      Alert.alert(
        "Success! 📸",
        "Your proof photo has been saved to your gallery. " +
          "It will be automatically deleted from our server after 90 minutes, " +
          "but will remain on your device."
      );
    } catch (error) {
      console.error("Error organizing photo:", error);
      // Photo is still on device from camera/picker
      Alert.alert(
        "Photo Saved",
        "Your proof photo is saved on your device. " +
          "It will be deleted from our server after 90 minutes."
      );
    }
  };

  const submitProofAndComplete = async () => {
    if (!capturedImage || !selectedTaskId) return;

    try {
      Alert.alert(
        "Uploading...",
        "Please wait while we upload your proof photo"
      );

      // Save photo to device first (it's already local from camera/picker)
      if (capturedImage) {
        await savePhotoToDevice(capturedImage);
      }

      // Upload proof to server
      const proofResponse = await api.proofs.upload(
        selectedTaskId,
        capturedImage
      );

      // Complete task
      const completeResponse = await api.tasks.complete(selectedTaskId);

      let message = `+${
        completeResponse.xpAwarded + (proofResponse.xpBonus || 0)
      } XP earned!`;
      if (completeResponse.newLevel) {
        message += `\n🎉 Level Up! You're now level ${completeResponse.newLevel}!`;
      }
      if (completeResponse.newBadges && completeResponse.newBadges.length > 0) {
        message += `\n🏆 New Badge: ${completeResponse.newBadges
          .map((b: any) => b.name)
          .join(", ")}`;
      }
      if (proofResponse.xpBonus) {
        message += `\n📸 Proof Photo Bonus: +${proofResponse.xpBonus} XP!`;
      }

      Alert.alert("Task Completed! ✅", message);

      // Reset states
      setProofModalVisible(false);
      setCapturedImage(null);
      setSelectedTaskId(null);
      await fetchTasks();
    } catch (error: any) {
      console.error("Error submitting proof:", error);
      Alert.alert("Error", error.message || "Failed to submit proof");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTasks(), fetchHabits()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, []);

  const groupTasksByDate = () => {
    const grouped = tasks.reduce((acc: { [key: string]: Task[] }, task) => {
      const date = task.scheduled_for;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});

    return Object.entries(grouped).sort(([dateA], [dateB]) =>
      dateA.localeCompare(dateB)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {groupTasksByDate().map(([date, dateTasks]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {dateTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, { opacity: task.completed ? 0.6 : 1 }]}
                onPress={() => !task.completed && handleCompleteTask(task.id)}
                disabled={task.completed}
              >
                <View style={styles.taskHeader}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed && styles.completedText,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.xpReward}>+{task.xp_reward} XP</Text>
                </View>
                {task.description && (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                )}
                {task.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}> Completed</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
        {tasks.length === 0 && (
          <Text style={styles.emptyText}>
            No tasks yet. Create your first task!{" "}
          </Text>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newTask.description}
              onChangeText={(text) =>
                setNewTask({ ...newTask, description: text })
              }
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Select Habit (Optional):</Text>
            <ScrollView style={styles.habitsList}>
              <TouchableOpacity
                style={[
                  styles.habitOption,
                  !newTask.habitId && styles.habitOptionSelected,
                ]}
                onPress={() => setNewTask({ ...newTask, habitId: "" })}
              >
                <Text
                  style={[
                    styles.habitOptionText,
                    !newTask.habitId && styles.habitOptionTextSelected,
                  ]}
                >
                  ⭐ None (Standalone Task)
                </Text>
              </TouchableOpacity>
              {habits.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.habitOption,
                    newTask.habitId === habit.id && styles.habitOptionSelected,
                  ]}
                  onPress={() => setNewTask({ ...newTask, habitId: habit.id })}
                >
                  <Text
                    style={[
                      styles.habitOptionText,
                      newTask.habitId === habit.id &&
                        styles.habitOptionTextSelected,
                    ]}
                  >
                    {habit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>XP Reward:</Text>
            <TextInput
              style={styles.input}
              placeholder="XP Reward"
              value={newTask.xpReward}
              onChangeText={(text) =>
                setNewTask({
                  ...newTask,
                  xpReward: text.replace(/[^0-9]/g, ""),
                })
              }
              keyboardType="numeric"
            />

            <Text style={styles.label}>Scheduled For:</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newTask.scheduledFor}
              onChangeText={(text) =>
                setNewTask({ ...newTask, scheduledFor: text })
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateTask}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Proof Photo Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={proofModalVisible}
        onRequestClose={() => {
          setProofModalVisible(false);
          setCapturedImage(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.proofModalContent}>
            <Text style={styles.modalTitle}>Proof Photo Required 📸</Text>
            <Text style={styles.proofNote}>
              Photo verification is mandatory to complete this task. Your photo
              will be saved to your device and automatically deleted from our
              server after 90 minutes for privacy.
            </Text>

            {capturedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: capturedImage }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setCapturedImage(null)}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoOptions}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={takePhoto}
                >
                  <Text style={styles.photoButtonIcon}>📷</Text>
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={pickImage}
                >
                  <Text style={styles.photoButtonIcon}>🖼️</Text>
                  <Text style={styles.photoButtonText}>
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setProofModalVisible(false);
                  setCapturedImage(null);
                  setSelectedTaskId(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.createButton,
                  !capturedImage && styles.disabledButton,
                ]}
                onPress={submitProofAndComplete}
                disabled={!capturedImage}
              >
                <Text style={styles.createButtonText}>Submit & Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TasksScreen;
