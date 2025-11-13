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
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import api from "../services/api";
import styles from "../styles/screens/TasksScreen.styles";

interface Task {
  id: string;
  title: string;
  description: string;
  scheduled_for: string;
  completed: boolean;
  is_completed: boolean;
  xp_reward: number;
  habit_id?: string; // Optional - tasks can be standalone or under habits
}

interface Habit {
  id: string;
  name: string;
  title: string;
  frequency: string;
}

const TasksScreen = ({ route }: any) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedHabitFilter, setSelectedHabitFilter] = useState<string | null>(
    route?.params?.habitId || null
  );
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    habitId: route?.params?.habitId || "",
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

      // Note: Camera photos are auto-saved by Android to your gallery
      // We'll try to organize them into an album later if we have permission
      console.log(
        "✅ Camera permission granted - photos will be saved automatically"
      );

      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return true; // Allow to proceed - camera will save photos
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
    // Offer to share/save the photo
    Alert.alert(
      "Save Photo? 📸",
      "Would you like to save this proof photo to your device?",
      [
        { text: "No, Thanks", style: "cancel" },
        {
          text: "Save Photo",
          onPress: async () => {
            try {
              const isAvailable = await Sharing.isAvailableAsync();
              if (isAvailable) {
                await Sharing.shareAsync(localUri, {
                  mimeType: "image/jpeg",
                  dialogTitle: "Save your task proof photo",
                });
                console.log("✅ Photo shared - user can save it");
              } else {
                Alert.alert("Info", "Photo uploaded to server successfully!");
              }
            } catch (error) {
              console.error("Error sharing photo:", error);
              Alert.alert("Note", "Photo uploaded to server successfully!");
            }
          },
        },
      ]
    );
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

      let message = `Task completed! +${
        completeResponse.xpAwarded + (proofResponse.xpBonus || 0)
      } XP earned!\n📸 Photo saved to your gallery!`;
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

  const handleClearCompleted = async () => {
    const completedCount = tasks.filter((t) => t.is_completed).length;

    if (completedCount === 0) {
      Alert.alert(
        "No Completed Tasks",
        "There are no completed tasks to clear."
      );
      return;
    }

    Alert.alert(
      "Clear Completed Tasks",
      `Are you sure you want to delete ${completedCount} completed task${
        completedCount > 1 ? "s" : ""
      }? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.tasks.deleteCompleted();
              await fetchTasks();
              Alert.alert("Success", "Completed tasks deleted successfully!");
            } catch (error: any) {
              console.error("Error deleting completed tasks:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete completed tasks"
              );
            }
          },
        },
      ]
    );
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
    // Filter by selected habit if one is selected
    const filteredTasks = selectedHabitFilter
      ? tasks.filter((t) => t.habit_id === selectedHabitFilter)
      : tasks;

    const grouped = filteredTasks.reduce(
      (acc: { [key: string]: Task[] }, task) => {
        const date = task.scheduled_for;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(task);
        return acc;
      },
      {}
    );

    return Object.entries(grouped).sort(([dateA], [dateB]) =>
      dateA.localeCompare(dateB)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tasks</Text>
          {route?.params?.habitName && (
            <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
              for {route.params.habitName}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#EF4444" }]}
            onPress={handleClearCompleted}
          >
            <Text style={styles.addButtonText}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Habit Filter */}
      <ScrollView
        horizontal
        style={{ maxHeight: 50, marginBottom: 10 }}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            {
              padding: 8,
              paddingHorizontal: 16,
              margin: 5,
              borderRadius: 20,
              backgroundColor: !selectedHabitFilter ? "#3B82F6" : "#E5E7EB",
            },
          ]}
          onPress={() => setSelectedHabitFilter(null)}
        >
          <Text
            style={{
              color: !selectedHabitFilter ? "white" : "#6B7280",
              fontWeight: "600",
            }}
          >
            All Tasks
          </Text>
        </TouchableOpacity>
        {habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            style={[
              {
                padding: 8,
                paddingHorizontal: 16,
                margin: 5,
                borderRadius: 20,
                backgroundColor:
                  selectedHabitFilter === habit.id ? "#3B82F6" : "#E5E7EB",
              },
            ]}
            onPress={() => setSelectedHabitFilter(habit.id)}
          >
            <Text
              style={{
                color: selectedHabitFilter === habit.id ? "white" : "#6B7280",
                fontWeight: "600",
              }}
            >
              {habit.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
                style={[
                  styles.taskCard,
                  { opacity: task.is_completed ? 0.6 : 1 },
                ]}
                onPress={() =>
                  !task.is_completed && handleCompleteTask(task.id)
                }
                disabled={task.is_completed}
              >
                <View style={styles.taskHeader}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.is_completed && styles.completedText,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.xpReward}>+{task.xp_reward} XP</Text>
                </View>
                {task.description && (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                )}
                {task.is_completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Done</Text>
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
                    {habit.title}
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
