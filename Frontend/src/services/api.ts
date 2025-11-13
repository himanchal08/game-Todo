import { supabase } from "./supabase";

// Get API URL from environment
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Helper to get auth token
const getAuthToken = async (): Promise<string | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// Helper for authenticated requests
const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

// ============================================
// AUTH APIs
// ============================================
export const authAPI = {
  signup: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Signup failed");
    }

    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    return response.json();
  },

  logout: async () => {
    const response = await authenticatedFetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Logout failed");
    }

    return response.json();
  },

  getProfile: async () => {
    const response = await authenticatedFetch("/api/auth/profile");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch profile");
    }

    return response.json();
  },

  updateProfile: async (data: { username?: string; avatar_url?: string }) => {
    const response = await authenticatedFetch("/api/auth/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update profile");
    }

    return response.json();
  },
};

// ============================================
// HABITS APIs
// ============================================
export const habitsAPI = {
  create: async (habit: {
    name: string;
    description?: string;
    frequency: string;
    reminder_time?: string;
  }) => {
    const response = await authenticatedFetch("/api/habits", {
      method: "POST",
      body: JSON.stringify(habit),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create habit");
    }

    return response.json();
  },

  getAll: async () => {
    const response = await authenticatedFetch("/api/habits");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch habits");
    }

    return response.json();
  },

  getById: async (id: string) => {
    const response = await authenticatedFetch(`/api/habits/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch habit");
    }

    return response.json();
  },

  update: async (
    id: string,
    habit: Partial<{
      name: string;
      description: string;
      frequency: string;
      reminder_time: string;
    }>
  ) => {
    const response = await authenticatedFetch(`/api/habits/${id}`, {
      method: "PUT",
      body: JSON.stringify(habit),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update habit");
    }

    return response.json();
  },

  delete: async (id: string) => {
    const response = await authenticatedFetch(`/api/habits/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete habit");
    }

    return response.json();
  },
};

// ============================================
// TASKS APIs
// ============================================
export const tasksAPI = {
  create: async (task: {
    habit_id?: string; // Optional - tasks can be standalone or under habits
    title: string;
    description?: string;
    xp_reward: number;
    scheduled_for: string;
  }) => {
    const response = await authenticatedFetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create task");
    }

    return response.json();
  },

  getTodayTasks: async () => {
    const response = await authenticatedFetch("/api/tasks/today");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch today's tasks");
    }

    return response.json();
  },

  getByHabit: async (habitId: string) => {
    const response = await authenticatedFetch(`/api/tasks/habit/${habitId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch habit tasks");
    }

    return response.json();
  },

  complete: async (taskId: string) => {
    const response = await authenticatedFetch(`/api/tasks/${taskId}/complete`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to complete task");
    }

    return response.json();
  },
};

// ============================================
// XP APIs
// ============================================
export const xpAPI = {
  getHistory: async () => {
    const response = await authenticatedFetch("/api/xp/history");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch XP history");
    }

    return response.json();
  },

  getStats: async () => {
    const response = await authenticatedFetch("/api/xp/stats");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch XP stats");
    }

    return response.json();
  },
};

// ============================================
// STREAKS APIs
// ============================================
export const streaksAPI = {
  getAll: async () => {
    const response = await authenticatedFetch("/api/streaks");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch streaks");
    }

    return response.json();
  },

  recover: async (habitId: string) => {
    const response = await authenticatedFetch("/api/streaks/recover", {
      method: "POST",
      body: JSON.stringify({ habit_id: habitId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to recover streak");
    }

    return response.json();
  },
};

// ============================================
// PROOFS APIs
// ============================================
export const proofsAPI = {
  upload: async (taskId: string, imageUri: string) => {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("task_id", taskId);

    // For React Native, format the image properly
    const uriParts = imageUri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    formData.append("proof", {
      uri: imageUri,
      name: `proof.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const response = await fetch(`${API_URL}/api/proofs/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser/RN set it
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload proof");
    }

    return response.json();
  },

  getByTask: async (taskId: string) => {
    const response = await authenticatedFetch(`/api/proofs/task/${taskId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch task proofs");
    }

    return response.json();
  },

  getUserProofs: async () => {
    const response = await authenticatedFetch("/api/proofs/user");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user proofs");
    }

    return response.json();
  },

  getStats: async () => {
    const response = await authenticatedFetch("/api/proofs/stats");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch proof stats");
    }

    return response.json();
  },

  delete: async (proofId: string) => {
    const response = await authenticatedFetch(`/api/proofs/${proofId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete proof");
    }

    return response.json();
  },
};

// ============================================
// NOTIFICATIONS APIs
// ============================================
export const notificationsAPI = {
  registerToken: async (pushToken: string) => {
    const response = await authenticatedFetch("/api/notifications/token", {
      method: "POST",
      body: JSON.stringify({ push_token: pushToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to register push token");
    }

    return response.json();
  },

  removeToken: async () => {
    const response = await authenticatedFetch("/api/notifications/token", {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to remove push token");
    }

    return response.json();
  },

  getPreferences: async () => {
    const response = await authenticatedFetch("/api/notifications/preferences");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch preferences");
    }

    return response.json();
  },

  updatePreferences: async (preferences: {
    daily_reminders?: boolean;
    streak_alerts?: boolean;
    achievement_alerts?: boolean;
  }) => {
    const response = await authenticatedFetch(
      "/api/notifications/preferences",
      {
        method: "PUT",
        body: JSON.stringify(preferences),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update preferences");
    }

    return response.json();
  },

  getHistory: async () => {
    const response = await authenticatedFetch("/api/notifications/history");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch notification history");
    }

    return response.json();
  },

  markAsRead: async (notificationId: string) => {
    const response = await authenticatedFetch(
      `/api/notifications/${notificationId}/read`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to mark notification as read");
    }

    return response.json();
  },

  getAll: async () => {
    const response = await authenticatedFetch("/api/notifications");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch notifications");
    }

    return response.json();
  },

  markAllAsRead: async () => {
    const response = await authenticatedFetch("/api/notifications/read-all", {
      method: "PUT",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to mark all as read");
    }

    return response.json();
  },

  delete: async (notificationId: string) => {
    const response = await authenticatedFetch(
      `/api/notifications/${notificationId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete notification");
    }

    return response.json();
  },
};

// ============================================
// ANALYTICS APIs
// ============================================
export const analyticsAPI = {
  getHeatmap: async (days: number = 30) => {
    const response = await authenticatedFetch(
      `/api/analytics/heatmap?days=${days}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch heatmap");
    }

    return response.json();
  },

  getStats: async () => {
    const response = await authenticatedFetch("/api/analytics/stats");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch stats");
    }

    return response.json();
  },

  getDashboard: async () => {
    const response = await authenticatedFetch("/api/analytics/dashboard");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch dashboard");
    }

    return response.json();
  },

  getBadges: async () => {
    const response = await authenticatedFetch("/api/analytics/badges");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch badges");
    }

    return response.json();
  },

  getAllBadges: async () => {
    const response = await authenticatedFetch("/api/analytics/badges/all");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch all badges");
    }

    return response.json();
  },

  checkBadges: async () => {
    const response = await authenticatedFetch("/api/analytics/badges/check", {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to check badges");
    }

    return response.json();
  },
};

// Export all APIs
export default {
  auth: authAPI,
  habits: habitsAPI,
  tasks: tasksAPI,
  xp: xpAPI,
  streaks: streaksAPI,
  proofs: proofsAPI,
  notifications: notificationsAPI,
  analytics: analyticsAPI,
};
