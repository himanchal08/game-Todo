import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
  username: string;
  full_name: string;
  level: number;
  total_xp: number;
}

interface HabitStreak {
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  habit: {
    title: string;
    color: string;
  };
}

const ProfileScreen = () => {
  const { session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streaks, setStreaks] = useState<HabitStreak[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!session?.user) return;
    try {
      // First try to fetch the existing profile
      let { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, level, total_xp')
        .eq('id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const username = session.user.email?.split('@')[0] || 'user';
          const fullName = session.user.user_metadata?.full_name || username;
          
          // First, check if the user has verified their email
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user?.email_confirmed_at) {
            throw new Error('Please verify your email before creating a profile');
          }

          // Try to create profile
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              username,
              full_name: fullName,
              level: 1,
              total_xp: 0,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Profile creation error:', insertError);
            if (insertError.code === '42501') {
              throw new Error('Permission denied. Please verify your email and try logging out and back in.');
            }
            throw insertError;
          }
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to load profile data. Please check if you have verified your email and try logging out and back in.'
      );
    }
  };

  const fetchStreaks = async () => {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('streaks')
        .select(`
          habit_id,
          current_streak,
          longest_streak,
          habit:habits (
            title,
            color
          )
        `)
        .eq('user_id', session.user.id)
        .order('current_streak', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our HabitStreak interface
      const transformedStreaks = (data || []).map((streak: any) => ({
        habit_id: streak.habit_id,
        current_streak: streak.current_streak,
        longest_streak: streak.longest_streak,
        habit: {
          title: streak.habit?.title || '',
          color: streak.habit?.color || '#3B82F6'
        }
      }));
      
      setStreaks(transformedStreaks);
    } catch (error: any) {
      console.error('Error fetching streaks:', error);
      Alert.alert('Error', 'Failed to load streaks data');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    if (!authLoading && session?.user) {
      Promise.all([fetchProfile(), fetchStreaks()]).finally(() =>
        setLoading(false)
      );
    }
  }, [authLoading, session]);

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile?.full_name}</Text>
          <Text style={styles.username}>@{profile?.username}</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.level || 0}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.total_xp || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {streaks.length > 0
                ? Math.max(...streaks.map((s) => s.longest_streak))
                : 0}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Streaks</Text>
        {streaks
          .filter((streak) => streak.current_streak > 0)
          .map((streak) => (
            <View
              key={streak.habit_id}
              style={[
                styles.streakCard,
                { borderLeftColor: streak.habit.color },
              ]}
            >
              <View style={styles.streakInfo}>
                <Text style={styles.habitTitle}>{streak.habit.title}</Text>
                <Text style={styles.streakCount}>
                  🔥 {streak.current_streak} days
                </Text>
              </View>
              <Text style={styles.bestStreak}>
                Best: {streak.longest_streak} days
              </Text>
            </View>
          ))}
        {streaks.filter((streak) => streak.current_streak > 0).length === 0 && (
          <Text style={styles.emptyText}>No active streaks</Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    paddingTop: 40,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  streakCard: {
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
  streakInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  streakCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  bestStreak: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;