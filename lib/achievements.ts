/**
 * Achievement Logic
 * 
 * Defines achievement rules and detection logic.
 * Achievements are unlocked based on habit streaks, total completions, and diversity.
 */

export interface Achievement {
  name: string;
  description: string;
  streakRequired?: number;
  totalCompletionsRequired?: number;
  totalHabitsRequired?: number;
  tokenReward: number;
  icon: string;
}

// Streak-based achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    name: 'First Step',
    description: 'Complete your first habit',
    streakRequired: 1,
    tokenReward: 2,
    icon: '🎯',
  },
  {
    name: 'Consistency Starter',
    description: 'Complete a habit for 3 days in a row',
    streakRequired: 3,
    tokenReward: 5,
    icon: '🔥',
  },
  {
    name: 'Weekly Warrior',
    description: 'Complete a habit for 7 days in a row',
    streakRequired: 7,
    tokenReward: 10,
    icon: '⚔️',
  },
  {
    name: 'Two Week Champion',
    description: 'Complete a habit for 14 days in a row',
    streakRequired: 14,
    tokenReward: 20,
    icon: '🏆',
  },
  {
    name: 'Three Week Streak',
    description: 'Complete a habit for 21 days in a row',
    streakRequired: 21,
    tokenReward: 30,
    icon: '🎖️',
  },
  {
    name: 'Monthly Master',
    description: 'Complete a habit for 30 days in a row',
    streakRequired: 30,
    tokenReward: 50,
    icon: '👑',
  },
  {
    name: 'Unstoppable',
    description: 'Complete a habit for 50 days in a row',
    streakRequired: 50,
    tokenReward: 100,
    icon: '💪',
  },
  {
    name: 'Quarter Year',
    description: 'Complete a habit for 90 days in a row',
    streakRequired: 90,
    tokenReward: 200,
    icon: '🌟',
  },
  {
    name: 'Century Club',
    description: 'Complete a habit for 100 days in a row',
    streakRequired: 100,
    tokenReward: 250,
    icon: '💯',
  },
  {
    name: 'Half Year Hero',
    description: 'Complete a habit for 180 days in a row',
    streakRequired: 180,
    tokenReward: 500,
    icon: '🌟',
  },
  {
    name: 'Year Long Legend',
    description: 'Complete a habit for 365 days in a row',
    streakRequired: 365,
    tokenReward: 1000,
    icon: '🎖️',
  },
];

/**
 * Check if a streak unlocks any new achievements
 * Returns newly unlocked achievements
 */
export function checkAchievements(
  currentStreak: number,
  previousStreak: number
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (achievement.streakRequired) {
      if (
        currentStreak >= achievement.streakRequired &&
        previousStreak < achievement.streakRequired
      ) {
        newlyUnlocked.push(achievement);
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Check total completion achievements
 */
export function checkTotalCompletionAchievements(
  totalCompletions: number,
  previousTotal: number
): Achievement[] {
  const completionAchievements: Achievement[] = [
    {
      name: 'Getting Started',
      description: 'Complete 10 habits in total',
      totalCompletionsRequired: 10,
      tokenReward: 5,
      icon: '🌱',
    },
    {
      name: 'Habit Builder',
      description: 'Complete 25 habits in total',
      totalCompletionsRequired: 25,
      tokenReward: 10,
      icon: '🏗️',
    },
    {
      name: 'Dedicated',
      description: 'Complete 50 habits in total',
      totalCompletionsRequired: 50,
      tokenReward: 25,
      icon: '💎',
    },
    {
      name: 'Committed',
      description: 'Complete 100 habits in total',
      totalCompletionsRequired: 100,
      tokenReward: 50,
      icon: '🎯',
    },
    {
      name: 'Habit Master',
      description: 'Complete 250 habits in total',
      totalCompletionsRequired: 250,
      tokenReward: 100,
      icon: '🧙',
    },
    {
      name: 'Habit Guru',
      description: 'Complete 500 habits in total',
      totalCompletionsRequired: 500,
      tokenReward: 250,
      icon: '🧘',
    },
    {
      name: 'Habit Legend',
      description: 'Complete 1000 habits in total',
      totalCompletionsRequired: 1000,
      tokenReward: 500,
      icon: '⚡',
    },
  ];

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of completionAchievements) {
    if (achievement.totalCompletionsRequired) {
      if (
        totalCompletions >= achievement.totalCompletionsRequired &&
        previousTotal < achievement.totalCompletionsRequired
      ) {
        newlyUnlocked.push(achievement);
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Check habit diversity achievements
 */
export function checkHabitDiversityAchievements(
  totalHabits: number,
  previousTotal: number
): Achievement[] {
  const diversityAchievements: Achievement[] = [
    {
      name: 'Habit Collector',
      description: 'Create 5 different habits',
      totalHabitsRequired: 5,
      tokenReward: 10,
      icon: '📚',
    },
    {
      name: 'Variety Seeker',
      description: 'Create 10 different habits',
      totalHabitsRequired: 10,
      tokenReward: 20,
      icon: '🎨',
    },
    {
      name: 'Renaissance Person',
      description: 'Create 20 different habits',
      totalHabitsRequired: 20,
      tokenReward: 50,
      icon: '🎭',
    },
  ];

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of diversityAchievements) {
    if (achievement.totalHabitsRequired) {
      if (
        totalHabits >= achievement.totalHabitsRequired &&
        previousTotal < achievement.totalHabitsRequired
      ) {
        newlyUnlocked.push(achievement);
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Get all possible achievements
 */
export function getAllAchievements(): Achievement[] {
  return [
    ...ACHIEVEMENTS,
    {
      name: 'Getting Started',
      description: 'Complete 10 habits in total',
      totalCompletionsRequired: 10,
      tokenReward: 5,
      icon: '🌱',
    },
    {
      name: 'Habit Builder',
      description: 'Complete 25 habits in total',
      totalCompletionsRequired: 25,
      tokenReward: 10,
      icon: '🏗️',
    },
    {
      name: 'Dedicated',
      description: 'Complete 50 habits in total',
      totalCompletionsRequired: 50,
      tokenReward: 25,
      icon: '💎',
    },
    {
      name: 'Committed',
      description: 'Complete 100 habits in total',
      totalCompletionsRequired: 100,
      tokenReward: 50,
      icon: '🎯',
    },
    {
      name: 'Habit Master',
      description: 'Complete 250 habits in total',
      totalCompletionsRequired: 250,
      tokenReward: 100,
      icon: '🧙',
    },
    {
      name: 'Habit Guru',
      description: 'Complete 500 habits in total',
      totalCompletionsRequired: 500,
      tokenReward: 250,
      icon: '🧘',
    },
    {
      name: 'Habit Legend',
      description: 'Complete 1000 habits in total',
      totalCompletionsRequired: 1000,
      tokenReward: 500,
      icon: '⚡',
    },
    {
      name: 'Habit Collector',
      description: 'Create 5 different habits',
      totalHabitsRequired: 5,
      tokenReward: 10,
      icon: '📚',
    },
    {
      name: 'Variety Seeker',
      description: 'Create 10 different habits',
      totalHabitsRequired: 10,
      tokenReward: 20,
      icon: '🎨',
    },
    {
      name: 'Renaissance Person',
      description: 'Create 20 different habits',
      totalHabitsRequired: 20,
      tokenReward: 50,
      icon: '🎭',
    },
  ];
}
