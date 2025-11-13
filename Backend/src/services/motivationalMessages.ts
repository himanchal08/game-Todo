/**
 * Collection of motivational messages for different contexts
 */

export const morningMotivation = [
  "☀️ Good morning! Today is a fresh start. What will you accomplish?",
  "🌅 Rise and shine! Your future self will thank you for the work you do today.",
  "⭐ New day, new opportunities! Let's crush those goals!",
  "🎯 Good morning champion! Time to turn your dreams into reality.",
  "💪 Today is YOUR day! Let's make it count!",
  "🚀 Wake up with determination, go to bed with satisfaction!",
  "✨ Every morning is a chance to be better than yesterday.",
  "🔥 Great things never come from comfort zones. Let's go!",
];

export const eveningReflection = [
  "🌙 How did your day go? Reflect on your wins, big and small!",
  "⭐ End your day strong! Review what you've accomplished.",
  "✅ Time to wrap up. Be proud of what you completed today!",
  "🎯 Evening check-in: Did you move closer to your goals today?",
  "💯 Consistency is key! How many tasks did you complete?",
  "🌟 Before bed, celebrate your progress. You did great!",
];

export const midDayBoost = [
  "⚡ Midday energy boost! Keep the momentum going!",
  "💪 Halfway through the day. You're doing amazing!",
  "🎯 Quick reminder: Small steps lead to big results!",
  "🔥 Don't stop now! You're on a roll!",
  "⭐ Afternoon check-in: Stay focused, you've got this!",
  "✨ Take a breath, refocus, and finish strong!",
];

export const streakMessages = [
  "🔥 Your streak is fire! Keep it burning!",
  "⚡ Consistency is your superpower! {streak} days strong!",
  "💪 {streak} days in a row! You're unstoppable!",
  "🎯 {streak}-day streak! That's commitment right there!",
  "🌟 {streak} days of excellence! Keep going!",
  "🚀 You're on a {streak}-day journey to greatness!",
];

export const weekendMotivation = [
  "🎉 Weekend vibes! But winners keep winning. Stay focused!",
  "⭐ Weekends are for building dreams, not just dreaming!",
  "💪 Saturday grind hits different! Let's get it!",
  "🔥 Sunday success starts now! What will you accomplish?",
  "✨ Weekend warrior mode activated! Time to level up!",
];

export const achievementCelebration = [
  "🎊 Incredible! You've reached a new milestone!",
  "🏆 Look at you go! That's what dedication looks like!",
  "⭐ You earned it! Your hard work is paying off!",
  "🎉 Boom! Another goal crushed! Keep dominating!",
  "💎 You're becoming the best version of yourself!",
  "🌟 That's the spirit! Onward and upward!",
];

export const encouragementMessages = [
  "💫 Believe in yourself! You're capable of amazing things!",
  "🌈 One step at a time. You're making progress!",
  "💪 Tough times don't last, tough people do. Keep going!",
  "🎯 Focus on progress, not perfection!",
  "✨ You're stronger than you think!",
  "🚀 Every expert was once a beginner. Keep learning!",
  "💎 Diamonds are made under pressure. You've got this!",
  "🌟 Your only limit is you. Break through!",
];

export const taskReminders = [
  "📋 Quick reminder: You have pending tasks! Let's knock them out!",
  "✅ Task time! Small actions lead to big results!",
  "⏰ Your goals are waiting! Time to take action!",
  "🎯 Don't wait for tomorrow. Do it now!",
  "💪 Your future self will thank you for completing these tasks!",
];

export const comebackMessages = [
  "👋 We miss you! Your goals are still here waiting for you!",
  "💙 It's never too late to start again. Welcome back!",
  "✨ Ready for a fresh start? Your journey continues today!",
  "🎯 Let's pick up where you left off. You've got this!",
  "💪 Every comeback begins with a single step. Let's go!",
  "🌟 Your dreams haven't forgotten you. Time to chase them!",
];

export const levelUpMessages = [
  "⬆️ LEVEL UP! Your dedication is paying off!",
  "🎮 Achievement Unlocked: New Level! Keep grinding!",
  "⭐ You've ascended to Level {level}! What a legend!",
  "🚀 Level {level} reached! The sky's the limit!",
  "👑 Level {level} unlocked! You're becoming unstoppable!",
];

/**
 * Get a random message from a collection
 */
export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get a personalized message based on time of day
 */
export const getTimeBasedMessage = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return getRandomMessage(morningMotivation);
  } else if (hour >= 12 && hour < 17) {
    return getRandomMessage(midDayBoost);
  } else if (hour >= 17 && hour < 22) {
    return getRandomMessage(eveningReflection);
  } else {
    return getRandomMessage(encouragementMessages);
  }
};

/**
 * Get a weekend-specific message
 */
export const getWeekendMessage = (): string => {
  return getRandomMessage(weekendMotivation);
};

/**
 * Get a streak message with the streak count
 */
export const getStreakMessage = (streakDays: number): string => {
  const message = getRandomMessage(streakMessages);
  return message.replace("{streak}", streakDays.toString());
};

/**
 * Get a level up message with the level
 */
export const getLevelUpMessage = (level: number): string => {
  const message = getRandomMessage(levelUpMessages);
  return message.replace("{level}", level.toString());
};
