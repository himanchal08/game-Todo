import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { supabase } from '../services/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  is_completed: boolean;
  xp_reward: number;
  habit_id: string;
  habits: {
    title: string;
    color: string;
  };
}

interface Habit {
  id: string;
  title: string;
  color: string;
}

const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    habitId: '',
    dueDate: new Date().toISOString().split('T')[0],
    xpReward: '10',
  });

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*, habits(title, color)')
      .eq('user_id', user.id)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const fetchHabits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('habits')
      .select('id, title, color')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching habits:', error);
      return;
    }

    setHabits(data || []);
  };

  const handleCreateTask = async () => {
    console.log('Creating new task:', newTask); // Debug log

    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!newTask.habitId) {
      Alert.alert('Error', 'Please select a habit');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create tasks');
      return;
    }

    try {
      console.log('Creating task with data:', {
        user_id: user.id,
        habit_id: newTask.habitId,
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.dueDate,
        xp_reward: parseInt(newTask.xpReward),
      }); // Debug log

      const { data, error } = await supabase.from('tasks').insert({
        user_id: user.id,
        habit_id: newTask.habitId,
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.dueDate,
        xp_reward: parseInt(newTask.xpReward),
        is_completed: false, // Add this field explicitly
      }).select();

      if (error) {
        console.error('Error creating task:', error); // Debug log
        throw error;
      }

      console.log('Task created successfully:', data); // Debug log

      setModalVisible(false);
      setNewTask({
        title: '',
        description: '',
        habitId: '',
        dueDate: new Date().toISOString().split('T')[0],
        xpReward: '10',
      });
      await fetchTasks(); // Refresh the task list
      Alert.alert('Success', 'Task created successfully!');
    } catch (error: any) {
      console.error('Error in handleCreateTask:', error); // Debug log
      Alert.alert('Error', error.message || 'Failed to create task. Please try again.');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: true })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, []);

  const groupTasksByDate = () => {
    const grouped = tasks.reduce((acc: { [key: string]: Task[] }, task) => {
      const date = task.due_date;
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

      <ScrollView style={styles.taskList}>
        {groupTasksByDate().map(([date, dateTasks]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {dateTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  {
                    borderLeftColor: task.habits?.color || '#3B82F6',
                    opacity: task.is_completed ? 0.7 : 1,
                  },
                ]}
                onPress={() => !task.is_completed && handleCompleteTask(task.id)}
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
                <Text style={styles.habitName}>{task.habits?.title}</Text>
                {task.is_completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
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
            />

            <Text style={styles.label}>Select Habit:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.habitSelector}
            >
              {habits.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.habitChip,
                    {
                      backgroundColor:
                        newTask.habitId === habit.id
                          ? habit.color
                          : 'transparent',
                      borderColor: habit.color,
                    },
                  ]}
                  onPress={() => setNewTask({ ...newTask, habitId: habit.id })}
                >
                  <Text
                    style={[
                      styles.habitChipText,
                      {
                        color:
                          newTask.habitId === habit.id ? '#fff' : habit.color,
                      },
                    ]}
                  >
                    {habit.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="XP Reward"
              value={newTask.xpReward}
              onChangeText={(text) => setNewTask({ ...newTask, xpReward: text })}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
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
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#4B5563',
  },
  taskList: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  xpReward: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  habitName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#4B5563',
  },
  habitSelector: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  habitChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  habitChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  createButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
  },
  createButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default TasksScreen;