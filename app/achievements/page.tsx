"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Trophy, Flame, Star } from "lucide-react"
import { useHabits } from "@/contexts/HabitContext"
import { useUser } from "@clerk/nextjs"

interface Achievement {
  name: string
  unlockedAt: string
}

export default function Achievements() {
  const { isSignedIn } = useUser()
  const { habits, achievements: unlockedAchievements } = useHabits()
  const [achievementDetails, setAchievementDetails] = useState<Achievement[]>([])

  useEffect(() => {
    if (isSignedIn) {
      fetchAchievements()
    }
  }, [isSignedIn, unlockedAchievements])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      if (response.ok) {
        const data = await response.json()
        setAchievementDetails(data.achievements)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const allAchievements = [
    { name: 'First Step', description: 'Complete your first habit', icon: Award, requirement: 1, reward: 2, emoji: '🎯' },
    { name: 'Consistency Starter', description: 'Complete a habit for 3 days in a row', icon: Flame, requirement: 3, reward: 5, emoji: '🔥' },
    { name: 'Weekly Warrior', description: 'Complete a habit for 7 days in a row', icon: Trophy, requirement: 7, reward: 10, emoji: '⚔️' },
    { name: 'Two Week Champion', description: 'Complete a habit for 14 days in a row', icon: Trophy, requirement: 14, reward: 20, emoji: '🏆' },
    { name: 'Three Week Streak', description: 'Complete a habit for 21 days in a row', icon: Award, requirement: 21, reward: 30, emoji: '🎖️' },
    { name: 'Monthly Master', description: 'Complete a habit for 30 days in a row', icon: Star, requirement: 30, reward: 50, emoji: '👑' },
    { name: 'Unstoppable', description: 'Complete a habit for 50 days in a row', icon: Flame, requirement: 50, reward: 100, emoji: '💪' },
    { name: 'Quarter Year', description: 'Complete a habit for 90 days in a row', icon: Star, requirement: 90, reward: 200, emoji: '🌟' },
    { name: 'Century Club', description: 'Complete a habit for 100 days in a row', icon: Trophy, requirement: 100, reward: 250, emoji: '💯' },
    { name: 'Half Year Hero', description: 'Complete a habit for 180 days in a row', icon: Star, requirement: 180, reward: 500, emoji: '🌟' },
    { name: 'Year Long Legend', description: 'Complete a habit for 365 days in a row', icon: Award, requirement: 365, reward: 1000, emoji: '🎖️' },
    { name: 'Getting Started', description: 'Complete 10 habits in total', icon: Award, requirement: 10, reward: 5, emoji: '🌱' },
    { name: 'Habit Builder', description: 'Complete 25 habits in total', icon: Trophy, requirement: 25, reward: 10, emoji: '🏗️' },
    { name: 'Dedicated', description: 'Complete 50 habits in total', icon: Flame, requirement: 50, reward: 25, emoji: '💎' },
    { name: 'Committed', description: 'Complete 100 habits in total', icon: Star, requirement: 100, reward: 50, emoji: '🎯' },
    { name: 'Habit Master', description: 'Complete 250 habits in total', icon: Trophy, requirement: 250, reward: 100, emoji: '🧙' },
    { name: 'Habit Guru', description: 'Complete 500 habits in total', icon: Award, requirement: 500, reward: 250, emoji: '🧘' },
    { name: 'Habit Legend', description: 'Complete 1000 habits in total', icon: Star, requirement: 1000, reward: 500, emoji: '⚡' },
    { name: 'Habit Collector', description: 'Create 5 different habits', icon: Trophy, requirement: 5, reward: 10, emoji: '📚' },
    { name: 'Variety Seeker', description: 'Create 10 different habits', icon: Award, requirement: 10, reward: 20, emoji: '🎨' },
    { name: 'Renaissance Person', description: 'Create 20 different habits', icon: Star, requirement: 20, reward: 50, emoji: '🎭' },
  ]

  const maxStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0)

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-white">Achievements</h1>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 px-4 py-2 rounded-lg">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-semibold">
                {achievementDetails.length} / {allAchievements.length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 px-4 py-2 rounded-lg">
              <span className="text-2xl">🪙</span>
              <div className="flex flex-col">
                <span className="text-white font-bold">{achievementDetails.reduce((sum, a) => {
                  const achievement = allAchievements.find(ach => ach.name === a.name)
                  return sum + (achievement?.reward || 0)
                }, 0)}</span>
                <span className="text-white/60 text-xs">Earned</span>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {isSignedIn ? (
            allAchievements.map((achievement, index) => {
              const Icon = achievement.icon
              const isUnlocked = unlockedAchievements.includes(achievement.name)
              const progress = Math.min((maxStreak / achievement.requirement) * 100, 100)
              const unlockedDetail = achievementDetails.find(a => a.name === achievement.name)

              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    show: { opacity: 1, scale: 1 },
                  }}
                >
                  <Card 
                    className={`${
                      isUnlocked 
                        ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50" 
                        : "bg-white/10 border-white/20"
                    } transition-all hover:scale-105`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-white">
                        <div className={`p-2 rounded-full ${isUnlocked ? 'bg-yellow-500/20' : 'bg-white/10'}`}>
                          <Icon className={`h-6 w-6 ${isUnlocked ? "text-yellow-400" : "text-white/60"}`} />
                        </div>
                        <span>{achievement.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-white/80">{achievement.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{achievement.emoji}</span>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-lg">+{achievement.reward} 🪙</p>
                          <p className="text-white/60 text-xs">Token Reward</p>
                        </div>
                      </div>
                      
                      {!isUnlocked && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-white/60">
                            <span>Progress</span>
                            <span>{maxStreak} / {achievement.requirement}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {isUnlocked && (
                        <div className="space-y-2">
                          <p className="text-yellow-400 font-semibold flex items-center gap-2">
                            <Flame className="h-4 w-4" />
                            Unlocked!
                          </p>
                          {unlockedDetail && (
                            <p className="text-white/60 text-sm">
                              {new Date(unlockedDetail.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <Card className="bg-white/10 border-white/20 col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-white text-lg">Please sign in to view your achievements.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {isSignedIn && habits.length > 0 && (
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{habits.length}</p>
                <p className="text-white/60 text-sm">Total Habits</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{maxStreak}</p>
                <p className="text-white/60 text-sm">Best Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{achievementDetails.length}</p>
                <p className="text-white/60 text-sm">Achievements</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {habits.filter(h => h.completedToday).length}
                </p>
                <p className="text-white/60 text-sm">Completed Today</p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
