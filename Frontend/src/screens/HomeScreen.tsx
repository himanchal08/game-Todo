import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../services/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  xp_reward: number;
  habits: {
    title: string;
    color: string;
  };
}

interface Profile {
  level: number;
  total_xp: number;
  username: string;
}

const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*, habits(title, color)')
      .eq('user_id', user.id)
      .eq('due_date', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('level, total_xp, username')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const handleCompleteTask = async (taskId: string) => {
    const { error } = await supabase.auth.getSession();
    if (error) return;

    try {
      const response = await fetch(`YOUR_BACKEND_URL/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your authorization header here
        },
      });

      if (!response.ok) throw new Error('Failed to complete task');

      // Refresh data
      await Promise.all([fetchTodayTasks(), fetchProfile()]);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTodayTasks(), fetchProfile()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTodayTasks();
    fetchProfile();
  }, []);

  const calculateLevelProgress = () => {
    if (!profile) return 0;
    return ((profile.total_xp % 100) / 100) * 100; // 100 XP per level
  };

  return (
    <View style={styles.container}>
      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.welcomeText}>Welcome, {profile.username}!</Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {profile.level}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${calculateLevelProgress()}%` },
                ]}
              />
            </View>
            <Text style={styles.xpText}>{profile.total_xp} XP</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Today's Tasks</Text>

      <ScrollView
        style={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskCard,
              { borderLeftColor: task.habits?.color || '#3B82F6' },
            ]}
            onPress={() => !task.is_completed && handleCompleteTask(task.id)}
          >
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.xpReward}>+{task.xp_reward} XP</Text>
            </View>
            {task.description && (
              <Text style={styles.taskDescription}>{task.description}</Text>
            )}
            <Text style={styles.habitName}>{task.habits?.title}</Text>
            {task.is_completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        {tasks.length === 0 && (
          <Text style={styles.emptyText}>No tasks for today!</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
});

export default HomeScreen;