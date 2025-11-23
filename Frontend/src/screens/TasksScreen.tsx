import React, { useState, useEffect, useRef } from "react";
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
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import api from "../services/api";
import { COLORS, SPACING, RADIUS } from "../theme";

const { width } = Dimensions.get("window");

interface Task {
  id: string;
  title: string;
  description: string;
  scheduled_for: string;
  completed: boolean;
  is_completed: boolean;
  xp_reward: number;
  habit_id?: string;
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
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const modalScrollRef = useRef<ScrollView>(null);
  const proofModalScrollRef = useRef<ScrollView>(null);
  const aiModalScrollRef = useRef<ScrollView>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [editedSubtasks, setEditedSubtasks] = useState<any[]>([]);
  const [currentAiTaskId, setCurrentAiTaskId] = useState<string | null>(null);
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
    }
  };

  // Local XP preview to show in modal (keep consistent with backend formula)
  const computeXpPreview = (estimatedMinutes: number, difficultyScore = 5) => {
    const baseXPPerMinute = 0.2;
    const difficultyMultiplier = 1 + (difficultyScore - 5) / 5;
    const raw =
      (estimatedMinutes || 0) * baseXPPerMinute * difficultyMultiplier;
    return Math.max(1, Math.round(raw));
  };

  // Scroll modals to top when opened
  useEffect(() => {
    if (modalVisible) {
      modalScrollRef.current?.scrollTo({ y: 0, animated: false });
      setTimeout(() => {
        modalScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 50);
      setTimeout(() => {
        modalScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 200);
    }
  }, [modalVisible]);

  useEffect(() => {
    if (proofModalVisible) {
      proofModalScrollRef.current?.scrollTo({ y: 0, animated: false });
      setTimeout(() => {
        proofModalScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 50);
      setTimeout(() => {
        proofModalScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 200);
    }
  }, [proofModalVisible]);

  useEffect(() => {
    if (aiModalVisible) {
      aiModalScrollRef.current?.scrollTo({ y: 0, animated: false });
      setTimeout(() => {
        aiModalScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 50);
      setTimeout(() => {
        aiModalScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 200);
    }
  }, [aiModalVisible]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    try {
      const taskData: any = {
        title: newTask.title,
        description: newTask.description,
        xp_reward: parseInt(newTask.xpReward) || 50,
        scheduled_for: newTask.scheduledFor,
      };

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
      Alert.alert("Success", "Task created successfully! 🎯");
    } catch (error: any) {
      console.error("Error creating task:", error);
      Alert.alert("Error", error.message || "Failed to create task");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
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

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.tasks.delete(taskId);
              await fetchTasks();
              Alert.alert("Success", "Task deleted successfully!");
            } catch (error: any) {
              console.error("Error deleting task:", error);
              Alert.alert("Error", error.message || "Failed to delete task");
            }
          },
        },
      ]
    );
  };

  const requestPermissions = async () => {
    try {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to take photos"
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return true;
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
              }
            } catch (error) {
              console.error("Error sharing photo:", error);
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

      if (capturedImage) {
        await savePhotoToDevice(capturedImage);
      }

      const proofResponse = await api.proofs.upload(
        selectedTaskId,
        capturedImage
      );
      const completeResponse = await api.tasks.complete(selectedTaskId);

      let message = `Task completed! +${
        completeResponse.xpAwarded + (proofResponse.xpBonus || 0)
      } XP earned!\n📸 Photo saved!`;

      if (completeResponse.newLevel) {
        message += `\n🎉 Level Up! You're now level ${completeResponse.newLevel}!`;
      }
      if (completeResponse.newBadges && completeResponse.newBadges.length > 0) {
        message += `\n🏆 New Badge: ${completeResponse.newBadges
          .map((b: any) => b.name)
          .join(", ")}`;
      }
      if (proofResponse.xpBonus) {
        message += `\n📸 Proof Bonus: +${proofResponse.xpBonus} XP!`;
      }

      Alert.alert("Task Completed! ✅", message);

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
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.tasks.deleteCompleted();
              await fetchTasks();
              Alert.alert("Success", "Completed tasks deleted!");
            } catch (error: any) {
              console.error("Error deleting completed tasks:", error);
              Alert.alert("Error", error.message || "Failed to delete");
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
    const filteredTasks = selectedHabitFilter
      ? tasks.filter((t) => t.habit_id === selectedHabitFilter)
      : tasks;

    const grouped = filteredTasks.reduce(
      (acc: { [key: string]: Task[] }, task) => {
        // Use scheduled_for or fallback to today's date if missing
        const date =
          task.scheduled_for || new Date().toISOString().split("T")[0];
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "No Date";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = date.toDateString();
    if (dateStr === today.toDateString()) return "Today";
    if (dateStr === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Tasks</Text>
            {route?.params?.habitName && (
              <Text style={styles.headerSubtitle}>
                for {route.params.habitName}
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: "#EF444420" }]}
              onPress={handleClearCompleted}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Habit Filter */}
      <ScrollView
        horizontal
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedHabitFilter && styles.filterChipActive,
          ]}
          onPress={() => setSelectedHabitFilter(null)}
        >
          <Ionicons
            name="list"
            size={16}
            color={!selectedHabitFilter ? "#FFF" : COLORS.textLight}
          />
          <Text
            style={[
              styles.filterChipText,
              !selectedHabitFilter && styles.filterChipTextActive,
            ]}
          >
            All Tasks
          </Text>
        </TouchableOpacity>
        {habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            style={[
              styles.filterChip,
              selectedHabitFilter === habit.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedHabitFilter(habit.id)}
          >
            <Ionicons
              name="repeat"
              size={16}
              color={
                selectedHabitFilter === habit.id ? "#FFF" : COLORS.textLight
              }
            />
            <Text
              style={[
                styles.filterChipText,
                selectedHabitFilter === habit.id && styles.filterChipTextActive,
              ]}
            >
              {habit.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first task to get started!
            </Text>
          </View>
        ) : (
          groupTasksByDate().map(([date, dateTasks]) => (
            <View key={date} style={styles.dateSection}>
              <View style={styles.dateBadge}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <Text style={styles.dateCount}>({dateTasks.length})</Text>
              </View>

              {dateTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskCard,
                    task.is_completed && styles.taskCardCompleted,
                  ]}
                  onPress={() =>
                    !task.is_completed && handleCompleteTask(task.id)
                  }
                  disabled={task.is_completed}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskIconContainer}>
                    <View
                      style={[
                        styles.taskIcon,
                        {
                          backgroundColor: task.is_completed
                            ? `${COLORS.success}20`
                            : `${COLORS.primary}20`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          task.is_completed
                            ? "checkmark-circle"
                            : "checkbox-outline"
                        }
                        size={24}
                        color={
                          task.is_completed ? COLORS.success : COLORS.primary
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.is_completed && styles.taskTitleCompleted,
                      ]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text style={styles.taskDescription} numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}

                    <View style={styles.taskFooter}>
                      <View style={styles.xpBadge}>
                        <Ionicons
                          name="flash"
                          size={14}
                          color={COLORS.warning}
                        />
                        <Text style={styles.xpText}>+{task.xp_reward} XP</Text>
                      </View>

                      {task.is_completed && (
                        <View style={styles.completedBadge}>
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={COLORS.success}
                          />
                          <Text style={styles.completedText}>Done</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {!task.is_completed && (
                    <View style={styles.rightActions}>
                      <TouchableOpacity
                        style={styles.aiButton}
                        onPress={async () => {
                          try {
                            setAiLoading(true);
                            setCurrentAiTaskId(task.id);
                            const resp = await api.tasks.breakdown(task.id, {
                              maxParts: 6,
                            });
                            setAiResult(resp);
                            const subs = (resp.subtasks || []).map(
                              (s: any) => ({
                                title: s.title || "",
                                description: s.description || "",
                                estimatedMinutes:
                                  s.estimatedMinutes ||
                                  s.estimated_minutes ||
                                  10,
                                suggestedXp:
                                  s.suggestedXp ||
                                  s.suggested_xp ||
                                  s.suggestedXp ||
                                  0,
                              })
                            );
                            setEditedSubtasks(subs);
                            setAiModalVisible(true);
                          } catch (e: any) {
                            console.error("AI breakdown failed", e);
                            Alert.alert(
                              "Error",
                              e.message || "AI breakdown failed"
                            );
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                      >
                        <Ionicons
                          name="bulb-outline"
                          size={20}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteTaskButton}
                        onPress={() => handleDeleteTask(task.id, task.title)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#EF4444"
                        />
                      </TouchableOpacity>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={COLORS.textMuted}
                        style={styles.taskArrow}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Task</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={modalScrollRef}
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.inputLabel, styles.firstInputLabel]}>
                Task Title *
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task title"
                placeholderTextColor={COLORS.textMuted}
                value={newTask.title}
                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                autoFocus={false}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter description (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={newTask.description}
                onChangeText={(text) =>
                  setNewTask({ ...newTask, description: text })
                }
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Select Habit</Text>
              <TouchableOpacity
                style={[
                  styles.habitOption,
                  !newTask.habitId && styles.habitOptionSelected,
                ]}
                onPress={() => setNewTask({ ...newTask, habitId: "" })}
              >
                <Ionicons
                  name="star-outline"
                  size={20}
                  color={!newTask.habitId ? COLORS.primary : COLORS.textLight}
                />
                <Text
                  style={[
                    styles.habitOptionText,
                    !newTask.habitId && styles.habitOptionTextSelected,
                  ]}
                >
                  None (Standalone Task)
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
                  <Ionicons
                    name="repeat"
                    size={20}
                    color={
                      newTask.habitId === habit.id
                        ? COLORS.primary
                        : COLORS.textLight
                    }
                  />
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

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>XP Reward</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50"
                    placeholderTextColor={COLORS.textMuted}
                    value={newTask.xpReward}
                    onChangeText={(text) =>
                      setNewTask({
                        ...newTask,
                        xpReward: text.replace(/[^0-9]/g, ""),
                      })
                    }
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Scheduled For</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textMuted}
                    value={newTask.scheduledFor}
                    onChangeText={(text) =>
                      setNewTask({ ...newTask, scheduledFor: text })
                    }
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateTask}
              >
                <Text style={styles.createButtonText}>Create Task</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Proof Photo Required 📸</Text>
              <TouchableOpacity
                onPress={() => {
                  setProofModalVisible(false);
                  setCapturedImage(null);
                }}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView ref={proofModalScrollRef} style={styles.modalScroll}>
              <View style={styles.proofInfo}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.proofInfoText}>
                  Photo verification is mandatory to complete tasks. Your photo
                  will be saved to your device and automatically deleted from
                  our server after 90 minutes for privacy.
                </Text>
              </View>

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
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoOptions}>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={takePhoto}
                  >
                    <View style={styles.photoButtonIcon}>
                      <Ionicons
                        name="camera"
                        size={32}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text style={styles.photoButtonText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={pickImage}
                  >
                    <View style={styles.photoButtonIcon}>
                      <Ionicons
                        name="images"
                        size={32}
                        color={COLORS.secondary}
                      />
                    </View>
                    <Text style={styles.photoButtonText}>
                      Choose from Gallery
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
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
                  styles.modalButton,
                  styles.createButton,
                  !capturedImage && styles.disabledButton,
                ]}
                onPress={submitProofAndComplete}
                disabled={!capturedImage}
              >
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.createButtonText}>Submit & Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Breakdown Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={aiModalVisible}
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Task Breakdown</Text>
              <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={aiModalScrollRef}
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              {aiLoading && (
                <Text style={{ color: COLORS.textMuted }}>
                  Generating suggestions...
                </Text>
              )}

              {!aiLoading && aiResult && (
                <View>
                  {aiResult.aiSummary ? (
                    <View style={{ marginBottom: SPACING.m }}>
                      <Text style={[styles.inputLabel]}>AI Summary</Text>
                      <Text style={{ color: COLORS.textLight }}>
                        {aiResult.aiSummary}
                      </Text>
                    </View>
                  ) : null}

                  <Text style={[styles.inputLabel]}>Suggested Subtasks</Text>

                  {editedSubtasks.map((st, idx) => (
                    <View key={idx} style={{ marginBottom: SPACING.m }}>
                      <Text style={{ fontWeight: "600", color: COLORS.text }}>
                        Step {idx + 1}
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={st.title}
                        onChangeText={(text) => {
                          const copy = [...editedSubtasks];
                          copy[idx].title = text;
                          setEditedSubtasks(copy);
                        }}
                        placeholder="Subtask title"
                        placeholderTextColor={COLORS.textMuted}
                      />
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={st.description}
                        onChangeText={(text) => {
                          const copy = [...editedSubtasks];
                          copy[idx].description = text;
                          setEditedSubtasks(copy);
                        }}
                        placeholder="Description (optional)"
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        numberOfLines={2}
                      />
                      <View style={{ flexDirection: "row", gap: SPACING.m }}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          value={String(st.estimatedMinutes)}
                          onChangeText={(text) => {
                            const copy = [...editedSubtasks];
                            copy[idx].estimatedMinutes =
                              Number(text.replace(/[^0-9]/g, "")) || 0;
                            setEditedSubtasks(copy);
                          }}
                          placeholder="Minutes"
                          keyboardType="numeric"
                        />

                        <View
                          style={[styles.input, { justifyContent: "center" }]}
                        >
                          <Text style={{ color: COLORS.text }}>
                            XP:{" "}
                            {st.suggestedXp ||
                              computeXpPreview(st.estimatedMinutes)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAiModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={async () => {
                  try {
                    if (!currentAiTaskId) return;
                    const body = {
                      subtasks: editedSubtasks.map((s) => ({
                        title: s.title,
                        description: s.description,
                        estimatedMinutes: s.estimatedMinutes,
                        suggestedXp: s.suggestedXp,
                      })),
                      applyXp: true,
                    };
                    const resp = await api.tasks.acceptBreakdown(
                      currentAiTaskId,
                      body
                    );
                    Alert.alert(
                      "Success",
                      `Created ${
                        resp.subtasks?.length || 0
                      } subtasks. XP awarded: ${resp.xpAwarded || 0}`
                    );
                    setAiModalVisible(false);
                    setEditedSubtasks([]);
                    setAiResult(null);
                    setCurrentAiTaskId(null);
                    await fetchTasks();
                  } catch (e: any) {
                    console.error("Accept AI breakdown failed", e);
                    Alert.alert(
                      "Error",
                      e.message || "Failed to create subtasks"
                    );
                  }
                }}
              >
                <Text style={styles.createButtonText}>Create Subtasks</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.l,
    paddingHorizontal: SPACING.l,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },

  headerActions: {
    flexDirection: "row",
    gap: SPACING.s,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    maxHeight: 70,
    backgroundColor: COLORS.background,
  },
  filterContent: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    gap: SPACING.s,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.l,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.m,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: SPACING.s,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  dateSection: {
    marginBottom: SPACING.l,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.s,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  dateCount: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  taskCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  taskIconContainer: {
    marginRight: SPACING.m,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  taskContent: {
    flex: 1,
    minWidth: 0,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.textLight,
  },
  taskDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.s,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.warning}20`,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: RADIUS.s,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.warning,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: RADIUS.s,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },
  taskArrow: {
    marginLeft: SPACING.s,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  aiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    marginRight: SPACING.s,
  },
  deleteTaskButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF444420",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.l,
    borderTopRightRadius: RADIUS.l,
    height: "95%",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    flexShrink: 1,
    marginRight: SPACING.s,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.s,
    marginTop: SPACING.m,
  },
  firstInputLabel: {
    marginTop: 0,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  habitOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.m,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    marginBottom: SPACING.s,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  habitOptionSelected: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },
  habitOptionText: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  habitOptionTextSelected: {
    color: COLORS.text,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  halfInput: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: "row",
    gap: SPACING.m,
    padding: SPACING.l,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.s,
    padding: SPACING.m,
    borderRadius: RADIUS.m,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  disabledButton: {
    opacity: 0.5,
  },
  proofInfo: {
    flexDirection: "row",
    gap: SPACING.m,
    backgroundColor: `${COLORS.primary}20`,
    padding: SPACING.m,
    borderRadius: RADIUS.m,
    marginBottom: SPACING.l,
  },
  proofInfoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    flexShrink: 1,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: SPACING.l,
  },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: RADIUS.m,
  },
  removeImageButton: {
    position: "absolute",
    top: SPACING.m,
    right: SPACING.m,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 16,
  },
  photoOptions: {
    flexDirection: "row",
    gap: SPACING.m,
    marginBottom: SPACING.l,
  },
  photoButton: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.l,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  photoButtonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
});

export default TasksScreen;
