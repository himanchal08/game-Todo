# Server Saviours - API Documentation

**Base URL:** `http://localhost:3000`  
**Version:** 1.0.0  
**Last Updated:** November 2, 2025

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Habits Management](#habits-management)
3. [Tasks Management](#tasks-management)
4. [XP & Leveling](#xp--leveling)
5. [Streaks](#streaks)
6. [Photo Proofs](#photo-proofs)
7. [Notifications](#notifications)
8. [Analytics & Badges](#analytics--badges)
9. [Error Handling](#error-handling)
10. [Badge System](#badge-system)

---

## 🔐 Authentication

All authenticated endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### POST `/api/auth/signup`

Create a new user account.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (201):**

```json
{
  "message": "Signup successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here"
  }
}
```

---

### POST `/api/auth/login`

Login with email and password.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here"
  }
}
```

---

### POST `/api/auth/logout`

Logout current user.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "message": "Logout successful"
}
```

---

### GET `/api/auth/profile`

Get current user profile.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "xp": 1250,
  "level": 13,
  "created_at": "2025-10-01T10:00:00Z"
}
```

---

### POST `/api/auth/profile`

Create or update user profile.

**Auth Required:** Yes

**Request Body:**

```json
{
  "username": "johndoe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Success Response (200):**

```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "uuid",
    "username": "johndoe",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

## 🎯 Habits Management

### POST `/api/habits`

Create a new habit.

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Morning Exercise",
  "description": "30 minutes of cardio",
  "frequency": "daily",
  "reminder_time": "07:00:00"
}
```

**Field Details:**

- `name` (required): Habit name (string)
- `description` (optional): Habit description (string)
- `frequency` (required): `"daily"`, `"weekly"`, or `"custom"`
- `reminder_time` (optional): Time in `HH:MM:SS` format

**Success Response (201):**

```json
{
  "message": "Habit created successfully",
  "habit": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio",
    "frequency": "daily",
    "reminder_time": "07:00:00",
    "created_at": "2025-11-02T10:00:00Z"
  }
}
```

---

### GET `/api/habits`

Get all habits for the current user.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "habits": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Morning Exercise",
      "description": "30 minutes of cardio",
      "frequency": "daily",
      "reminder_time": "07:00:00",
      "created_at": "2025-11-02T10:00:00Z"
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Read Books",
      "description": "Read for 20 minutes",
      "frequency": "daily",
      "reminder_time": "21:00:00",
      "created_at": "2025-11-01T15:30:00Z"
    }
  ]
}
```

---

### GET `/api/habits/:id`

Get a specific habit by ID.

**Auth Required:** Yes

**URL Parameters:**

- `id` (required): Habit UUID

**Success Response (200):**

```json
{
  "habit": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio",
    "frequency": "daily",
    "reminder_time": "07:00:00",
    "created_at": "2025-11-02T10:00:00Z"
  }
}
```

---

### PUT `/api/habits/:id`

Update a habit.

**Auth Required:** Yes

**URL Parameters:**

- `id` (required): Habit UUID

**Request Body:**

```json
{
  "name": "Morning Workout",
  "description": "45 minutes of exercise",
  "frequency": "daily",
  "reminder_time": "06:30:00"
}
```

**Success Response (200):**

```json
{
  "message": "Habit updated successfully",
  "habit": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Morning Workout",
    "description": "45 minutes of exercise",
    "frequency": "daily",
    "reminder_time": "06:30:00",
    "created_at": "2025-11-02T10:00:00Z"
  }
}
```

---

### DELETE `/api/habits/:id`

Delete a habit.

**Auth Required:** Yes

**URL Parameters:**

- `id` (required): Habit UUID

**Success Response (200):**

```json
{
  "message": "Habit deleted successfully"
}
```

---

## ✅ Tasks Management

### POST `/api/tasks`

Create a new task.

**Auth Required:** Yes

**Request Body:**

```json
{
  "habit_id": "uuid",
  "title": "Complete morning workout",
  "description": "30 min cardio session",
  "xp_reward": 50,
  "scheduled_for": "2025-11-02"
}
```

**Field Details:**

- `habit_id` (required): UUID of the habit
- `title` (required): Task title (string)
- `description` (optional): Task description (string)
- `xp_reward` (required): XP points (integer, typically 10-100)
- `scheduled_for` (required): Date in `YYYY-MM-DD` format

**Success Response (201):**

```json
{
  "message": "Task created successfully",
  "task": {
    "id": "uuid",
    "habit_id": "uuid",
    "user_id": "uuid",
    "title": "Complete morning workout",
    "description": "30 min cardio session",
    "xp_reward": 50,
    "completed": false,
    "scheduled_for": "2025-11-02",
    "created_at": "2025-11-02T08:00:00Z"
  }
}
```

---

### GET `/api/tasks/today`

Get all tasks scheduled for today.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "tasks": [
    {
      "id": "uuid",
      "habit_id": "uuid",
      "user_id": "uuid",
      "title": "Complete morning workout",
      "description": "30 min cardio session",
      "xp_reward": 50,
      "completed": false,
      "scheduled_for": "2025-11-02",
      "created_at": "2025-11-02T08:00:00Z",
      "habit": {
        "name": "Morning Exercise",
        "frequency": "daily"
      }
    }
  ]
}
```

---

### GET `/api/tasks/habit/:habitId`

Get all tasks for a specific habit.

**Auth Required:** Yes

**URL Parameters:**

- `habitId` (required): Habit UUID

**Success Response (200):**

```json
{
  "tasks": [
    {
      "id": "uuid",
      "habit_id": "uuid",
      "user_id": "uuid",
      "title": "Complete morning workout",
      "xp_reward": 50,
      "completed": true,
      "scheduled_for": "2025-11-01",
      "completed_at": "2025-11-01T07:30:00Z"
    },
    {
      "id": "uuid",
      "habit_id": "uuid",
      "user_id": "uuid",
      "title": "Complete morning workout",
      "xp_reward": 50,
      "completed": false,
      "scheduled_for": "2025-11-02"
    }
  ]
}
```

---

### POST `/api/tasks/:id/complete`

Mark a task as completed. Awards XP, logs activity, checks for new badges.

**Auth Required:** Yes

**URL Parameters:**

- `id` (required): Task UUID

**Success Response (200):**

```json
{
  "message": "Task completed!",
  "xpAwarded": 50,
  "newTotalXp": 1250,
  "newLevel": 13,
  "newBadges": [
    {
      "id": "uuid",
      "badge_id": "uuid",
      "name": "Task Warrior",
      "description": "Complete 100 tasks",
      "category": "task",
      "icon": "⚔️",
      "earned_at": "2025-11-02T10:30:00Z"
    }
  ]
}
```

**Note:** `newBadges` array only appears if badges were earned. Otherwise, it's `undefined`.

---

## ⚡ XP & Leveling

### GET `/api/xp/history`

Get XP earning history.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "history": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "xp_change": 50,
      "reason": "Task completed: Morning workout",
      "created_at": "2025-11-02T10:30:00Z"
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "xp_change": 10,
      "reason": "Proof uploaded with gold frame",
      "created_at": "2025-11-02T10:35:00Z"
    }
  ]
}
```

---

### GET `/api/xp/stats`

Get XP statistics and leveling info.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "total_xp": 1250,
  "current_level": 13,
  "xp_to_next_level": 50
}
```

**Level Calculation:**

- Each level requires 100 XP
- Level = Math.floor(total_xp / 100) + 1
- XP to next level = 100 - (total_xp % 100)

---

## 🔥 Streaks

### GET `/api/streaks`

Get all habit streaks for the current user.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "streaks": [
    {
      "habit_id": "uuid",
      "habit_name": "Morning Exercise",
      "current_streak": 15,
      "longest_streak": 30,
      "last_completed": "2025-11-02T08:30:00Z"
    },
    {
      "habit_id": "uuid",
      "habit_name": "Read Books",
      "current_streak": 7,
      "longest_streak": 20,
      "last_completed": "2025-11-02T21:00:00Z"
    }
  ]
}
```

---

### POST `/api/streaks/recover`

Recover a broken streak within 24 hours. Costs 50 XP.

**Auth Required:** Yes

**Request Body:**

```json
{
  "habit_id": "uuid"
}
```

**Success Response (200):**

```json
{
  "message": "Streak recovered successfully",
  "streak": {
    "habit_id": "uuid",
    "current_streak": 8,
    "longest_streak": 20
  },
  "xp_deducted": 50,
  "new_xp": 1200
}
```

**Error Responses:**

- `400`: "Cannot recover streak older than 24 hours"
- `400`: "Insufficient XP balance (need 50 XP)"
- `400`: "Streak already recovered once"

---

## 📸 Photo Proofs

### POST `/api/proofs/upload`

Upload a proof photo for a task. Includes automatic compression and duplicate detection.

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `proof` (required): Image file (max 10MB, jpg/jpeg/png)
- `task_id` (required): Task UUID

**Example using FormData (React Native / JavaScript):**

```javascript
const formData = new FormData();
formData.append("proof", {
  uri: imageUri,
  type: "image/jpeg",
  name: "proof.jpg",
});
formData.append("task_id", taskId);

fetch("http://localhost:3000/api/proofs/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  },
  body: formData,
});
```

**Success Response (201):**

```json
{
  "message": "Proof uploaded successfully",
  "proof": {
    "id": "uuid",
    "task_id": "uuid",
    "user_id": "uuid",
    "image_url": "https://supabase-storage-url/proof-snaps/uuid.jpg",
    "frame_type": "gold",
    "xp_bonus": 10,
    "created_at": "2025-11-02T10:35:00Z"
  },
  "compression": {
    "original_size": "237KB",
    "compressed_size": "50KB",
    "reduction_percentage": 79
  }
}
```

**Frame Types & XP Bonuses:**

- `basic` (streak 1-6): +5 XP
- `gold` (streak 7-29): +10 XP
- `prestige` (streak 30+): +20 XP

**Features:**

- ✅ Automatic image compression (Sharp library)
- ✅ Duplicate detection using perceptual hashing
- ✅ Frame evolution based on current streak
- ✅ Auto-cleanup after 90 days

**Error Responses:**

- `400`: "No file uploaded"
- `400`: "Duplicate image detected"
- `413`: File too large (>10MB)

---

### GET `/api/proofs/task/:taskId`

Get all proofs for a specific task.

**Auth Required:** Yes

**URL Parameters:**

- `taskId` (required): Task UUID

**Success Response (200):**

```json
{
  "proofs": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "user_id": "uuid",
      "image_url": "https://supabase-storage-url/proof-snaps/uuid.jpg",
      "frame_type": "gold",
      "xp_bonus": 10,
      "created_at": "2025-11-02T10:35:00Z"
    }
  ]
}
```

---

### GET `/api/proofs/user`

Get all proofs for the current user.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "proofs": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "image_url": "https://supabase-storage-url/proof-snaps/uuid.jpg",
      "frame_type": "prestige",
      "xp_bonus": 20,
      "created_at": "2025-11-02T10:35:00Z",
      "task": {
        "title": "Morning workout",
        "habit_name": "Exercise"
      }
    }
  ]
}
```

---

### GET `/api/proofs/stats`

Get proof upload statistics.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "total_proofs": 45,
  "frame_breakdown": {
    "basic": 15,
    "gold": 20,
    "prestige": 10
  },
  "total_bonus_xp": 650
}
```

---

### DELETE `/api/proofs/:id`

Delete a proof.

**Auth Required:** Yes

**URL Parameters:**

- `id` (required): Proof UUID

**Success Response (200):**

```json
{
  "message": "Proof deleted successfully"
}
```

---

## 🔔 Notifications

### POST `/api/notifications/token`

Register a push notification token (Expo Push Token).

**Auth Required:** Yes

**Request Body:**

```json
{
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Success Response (200):**

```json
{
  "message": "Push token registered successfully"
}
```

---

### DELETE `/api/notifications/token`

Remove push notification token.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "message": "Push token removed successfully"
}
```

---

### GET `/api/notifications/preferences`

Get notification preferences.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "daily_reminders": true,
  "streak_alerts": true,
  "achievement_alerts": true
}
```

---

### PUT `/api/notifications/preferences`

Update notification preferences.

**Auth Required:** Yes

**Request Body:**

```json
{
  "daily_reminders": true,
  "streak_alerts": false,
  "achievement_alerts": true
}
```

**Success Response (200):**

```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "daily_reminders": true,
    "streak_alerts": false,
    "achievement_alerts": true
  }
}
```

---

### GET `/api/notifications/history`

Get notification history.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Task Reminder",
      "body": "Don't forget to complete your morning workout!",
      "type": "daily_reminder",
      "read": false,
      "created_at": "2025-11-02T07:00:00Z"
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "New Badge Unlocked! 🎉",
      "body": "You earned the 'Week Warrior' badge!",
      "type": "achievement",
      "read": true,
      "created_at": "2025-11-01T10:30:00Z"
    }
  ]
}
```

**Notification Types:**

- `daily_reminder`: Daily task reminders
- `streak_alert`: Streak risk warnings
- `comeback_prompt`: Re-engagement messages
- `achievement`: Badge unlocks

---

### PUT `/api/notifications/:id/read`

Mark a notification as read.

**Auth Required:** Yes

**URL Parameters:**

- `id` (required): Notification UUID

**Success Response (200):**

```json
{
  "message": "Notification marked as read"
}
```

---

## 📊 Analytics & Badges

### GET `/api/analytics/heatmap`

Get activity heatmap (30-day calendar with activity levels).

**Auth Required:** Yes

**Query Parameters:**

- `days` (optional): Number of days (default: 30)

**Example:** `GET /api/analytics/heatmap?days=30`

**Success Response (200):**

```json
{
  "heatmap": [
    {
      "date": "2025-11-02",
      "tasks_completed": 5,
      "xp_earned": 250,
      "streaks_maintained": 3,
      "proofs_uploaded": 2,
      "activity_level": 4
    },
    {
      "date": "2025-11-01",
      "tasks_completed": 3,
      "xp_earned": 150,
      "streaks_maintained": 2,
      "proofs_uploaded": 1,
      "activity_level": 3
    },
    {
      "date": "2025-10-31",
      "tasks_completed": 0,
      "xp_earned": 0,
      "streaks_maintained": 0,
      "proofs_uploaded": 0,
      "activity_level": 0
    }
    // ... 27 more days
  ]
}
```

**Activity Level Scale:**

- `0`: No activity
- `1`: 1 task
- `2`: 2-3 tasks
- `3`: 4-5 tasks
- `4`: 6-7 tasks
- `5`: 8+ tasks

---

### GET `/api/analytics/stats`

Get user statistics.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "total_tasks_completed": 156,
  "total_xp": 7800,
  "current_level": 78,
  "total_habits": 5,
  "days_active": 45,
  "longest_streak": 30,
  "consistency_score": 75.5
}
```

**Consistency Score:** (days_active / 30) \* 100

---

### GET `/api/analytics/dashboard`

Get combined dashboard data (stats + heatmap + badges).

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "stats": {
    "total_tasks_completed": 156,
    "total_xp": 7800,
    "current_level": 78,
    "total_habits": 5,
    "days_active": 45,
    "longest_streak": 30,
    "consistency_score": 75.5
  },
  "heatmap": [
    {
      "date": "2025-11-02",
      "tasks_completed": 5,
      "xp_earned": 250,
      "activity_level": 4
    }
    // ... 29 more days
  ],
  "badges": [
    {
      "id": "uuid",
      "badge_id": "uuid",
      "name": "Week Warrior",
      "description": "Maintain a 7-day streak",
      "category": "streak",
      "icon": "🔥",
      "earned_at": "2025-10-15T10:00:00Z"
    }
  ],
  "recentBadges": [
    // Last 5 earned badges
  ]
}
```

---

### GET `/api/analytics/badges`

Get user's earned badges.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "badges": [
    {
      "id": "uuid",
      "badge_id": "uuid",
      "name": "First Steps",
      "description": "Complete your first task",
      "category": "task",
      "icon": "🎯",
      "requirement": 1,
      "earned_at": "2025-10-01T10:00:00Z"
    },
    {
      "id": "uuid",
      "badge_id": "uuid",
      "name": "Week Warrior",
      "description": "Maintain a 7-day streak",
      "category": "streak",
      "icon": "🔥",
      "requirement": 7,
      "earned_at": "2025-10-15T10:00:00Z"
    }
  ]
}
```

---

### GET `/api/analytics/badges/all`

Get all badges with progress (earned and unearned).

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "badges": [
    {
      "id": "uuid",
      "name": "First Steps",
      "description": "Complete your first task",
      "category": "task",
      "icon": "🎯",
      "requirement": 1,
      "earned": true,
      "earned_at": "2025-10-01T10:00:00Z",
      "progress": 100
    },
    {
      "id": "uuid",
      "name": "Task Warrior",
      "description": "Complete 100 tasks",
      "category": "task",
      "icon": "⚔️",
      "requirement": 100,
      "earned": false,
      "progress": 45
    },
    {
      "id": "uuid",
      "name": "XP Master",
      "description": "Earn 10,000 XP",
      "category": "xp",
      "icon": "💎",
      "requirement": 10000,
      "earned": false,
      "progress": 78
    }
    // ... 15 more badges
  ]
}
```

**Progress Calculation:**

- `progress`: Percentage (0-100) showing how close user is to earning the badge
- Formula: `(current_value / requirement) * 100`

---

### POST `/api/analytics/badges/check`

Manually trigger badge checking. Checks all badge requirements and awards new badges.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "message": "Badge check completed",
  "newBadges": [
    {
      "id": "uuid",
      "badge_id": "uuid",
      "name": "Half Century",
      "description": "Complete 50 tasks",
      "category": "task",
      "icon": "🎖️",
      "earned_at": "2025-11-02T10:30:00Z"
    }
  ]
}
```

**Note:** If no new badges earned, `newBadges` will be an empty array.

---

## 🎮 Badge System

### Badge Categories & Complete List

#### 🔥 Streak Badges (5)

| Badge         | Icon | Requirement | Description                      |
| ------------- | ---- | ----------- | -------------------------------- |
| First Streak  | 🔥   | 1 day       | Complete your first daily streak |
| Week Warrior  | 🔥   | 7 days      | Maintain a 7-day streak          |
| Month Master  | 🔥   | 30 days     | Maintain a 30-day streak         |
| Century Club  | 🔥   | 100 days    | Maintain a 100-day streak        |
| Streak Legend | 🔥   | 365 days    | Maintain a 365-day streak        |

#### ✅ Task Badges (5)

| Badge           | Icon | Requirement | Description              |
| --------------- | ---- | ----------- | ------------------------ |
| First Steps     | 🎯   | 1 task      | Complete your first task |
| Getting Started | 🎯   | 10 tasks    | Complete 10 tasks        |
| Half Century    | 🎖️   | 50 tasks    | Complete 50 tasks        |
| Task Warrior    | ⚔️   | 100 tasks   | Complete 100 tasks       |
| Task Legend     | 👑   | 1000 tasks  | Complete 1000 tasks      |

#### ⚡ XP Badges (5)

| Badge      | Icon | Requirement | Description     |
| ---------- | ---- | ----------- | --------------- |
| XP Novice  | ⭐   | 1,000 XP    | Earn 1,000 XP   |
| XP Warrior | 💫   | 5,000 XP    | Earn 5,000 XP   |
| XP Master  | 💎   | 10,000 XP   | Earn 10,000 XP  |
| XP Legend  | 🏆   | 50,000 XP   | Earn 50,000 XP  |
| XP God     | 👑   | 100,000 XP  | Earn 100,000 XP |

#### 📅 Consistency Badges (3)

| Badge               | Icon | Requirement     | Description            |
| ------------------- | ---- | --------------- | ---------------------- |
| Consistent Week     | 📅   | 7 days active   | Be active for 7 days   |
| Consistent Month    | 📆   | 30 days active  | Be active for 30 days  |
| Consistent Champion | 🏅   | 100 days active | Be active for 100 days |

**Total Badges: 18**

### Badge Notification

When a user earns a new badge:

1. Badge is automatically saved to `user_badges` table
2. Push notification is sent (if enabled)
3. Badge appears in `/api/tasks/:id/complete` response
4. Badge appears in dashboard and analytics

---

## ❌ Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning               | Common Causes                                    |
| ---- | --------------------- | ------------------------------------------------ |
| 200  | OK                    | Successful request                               |
| 201  | Created               | Resource created successfully                    |
| 400  | Bad Request           | Invalid input, missing fields, validation errors |
| 401  | Unauthorized          | Missing or invalid JWT token                     |
| 403  | Forbidden             | User doesn't have permission                     |
| 404  | Not Found             | Resource doesn't exist                           |
| 409  | Conflict              | Duplicate resource (e.g., duplicate image)       |
| 413  | Payload Too Large     | File size exceeds limit                          |
| 500  | Internal Server Error | Server error                                     |

### Common Error Examples

**401 Unauthorized:**

```json
{
  "error": "No token provided"
}
```

**400 Bad Request:**

```json
{
  "error": "Missing required field: habit_id"
}
```

**404 Not Found:**

```json
{
  "error": "Task not found"
}
```

**409 Conflict:**

```json
{
  "error": "Duplicate image detected. This proof photo has already been uploaded."
}
```

---

## 🚀 Quick Start Guide

### 1. User Authentication Flow

```javascript
// Step 1: Signup
const signupResponse = await fetch("http://localhost:3000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "SecurePass123",
  }),
});
const { session } = await signupResponse.json();
const token = session.access_token;

// Step 2: Store token for future requests
// Use token in Authorization header for all authenticated endpoints
```

### 2. Create Habit & Task Flow

```javascript
// Create a habit
const habitResponse = await fetch("http://localhost:3000/api/habits", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Morning Exercise",
    frequency: "daily",
    reminder_time: "07:00:00",
  }),
});
const { habit } = await habitResponse.json();

// Create a task for today
const taskResponse = await fetch("http://localhost:3000/api/tasks", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    habit_id: habit.id,
    title: "Morning workout",
    xp_reward: 50,
    scheduled_for: "2025-11-02",
  }),
});
const { task } = await taskResponse.json();
```

### 3. Complete Task & Upload Proof

```javascript
// Complete the task
const completeResponse = await fetch(
  `http://localhost:3000/api/tasks/${task.id}/complete`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const { xpAwarded, newLevel, newBadges } = await completeResponse.json();

// Upload proof photo
const formData = new FormData();
formData.append("proof", imageFile);
formData.append("task_id", task.id);

const proofResponse = await fetch("http://localhost:3000/api/proofs/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  },
  body: formData,
});
```

### 4. Get Dashboard Data

```javascript
const dashboardResponse = await fetch(
  "http://localhost:3000/api/analytics/dashboard",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const { stats, heatmap, badges } = await dashboardResponse.json();
```

---

## 📝 Notes for Frontend Team

### Important Implementation Notes

1. **Token Management:**
   - Store JWT token securely (AsyncStorage on React Native)
   - Include token in Authorization header for all authenticated requests
   - Handle 401 errors by redirecting to login

2. **Image Uploads:**
   - Use `multipart/form-data` content type
   - Images are automatically compressed on backend (79% reduction)
   - Duplicate detection prevents same photo upload
   - Max file size: 10MB

3. **Real-time Updates:**
   - Badge checks happen automatically on task completion
   - Activity logging is automatic (no need to call separately)
   - Heatmap updates daily

4. **Notification Setup:**
   - Register Expo push token after login
   - User can toggle notification preferences
   - Four types: daily reminders, streak alerts, comeback prompts, achievements

5. **XP & Leveling:**
   - 100 XP = 1 level
   - XP awarded on task completion
   - Bonus XP from proof uploads (frame evolution)
   - Streak recovery costs 50 XP

6. **Streak System:**
   - Streaks break after 24 hours of inactivity
   - 24-hour grace period for recovery
   - One recovery per streak allowed
   - Automatic streak risk notifications at 6 PM

7. **Badge Progress:**
   - 18 total badges across 4 categories
   - Progress tracked automatically
   - Notifications on unlock
   - Use `/api/analytics/badges/all` to show progress bars

8. **Performance:**
   - All list endpoints will be paginated in future updates
   - Cache dashboard data for better performance
   - Heatmap limited to 30 days by default

---

## 🔗 Endpoint Summary

**Total Endpoints: 41**

| Category       | Endpoints                 | Auth Required |
| -------------- | ------------------------- | ------------- |
| Health Check   | 1                         | ❌            |
| Authentication | 5                         | Mixed         |
| Habits         | 5                         | ✅            |
| Tasks          | 4                         | ✅            |
| XP             | 2                         | ✅            |
| Streaks        | 2                         | ✅            |
| Proofs         | 5                         | ✅            |
| Notifications  | 6                         | ✅            |
| Analytics      | 6                         | ✅            |
| Badges         | 3 (included in analytics) | ✅            |

---

## 📞 Support

For questions or issues, contact the backend team or create an issue in the repository.

**Repository:** [github.com/himanchal08/game-Todo](https://github.com/himanchal08/game-Todo)

---

**Last Updated:** November 2, 2025  
**Version:** 1.0.0  
**Status:** ✅ All endpoints tested and working
