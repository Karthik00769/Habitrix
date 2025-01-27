"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, Zap, Target, Flame, Crown, Star, TrendingUp, UserCircle2, Shield } from "lucide-react"
import { useHabits } from "@/contexts/HabitContext"
import { useUser } from "@clerk/nextjs"

interface Achievement {
  icon: React.ElementType
  title: string
  description: string
  calculateProgress: (habits: any[]) => number | (() => number)
  unlockThreshold: number
}

export default function Achievements() {
  const { isSignedIn } = useUser()  
  const { habits } = useHabits()
  const [achievementProgress, setAchievementProgress] = useState<number[]>([])

  useEffect(() => {
    if (isSignedIn) {
      const progress = achievements.map((achievement) =>
        typeof achievement.calculateProgress === "function"
          ? achievement.calculateProgress(habits) 
          : achievement.calculateProgress
      )
      setAchievementProgress(progress.map((p) => (typeof p === "number" ? p : 0))) 
    } else {
      setAchievementProgress(achievements.map(() => 0)) 
    }
  }, [habits, isSignedIn])

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Achievements</h1>

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
            achievements.map((achievement, index) => {
              const Icon = achievement.icon
              const progress = achievementProgress[index] || 0
              const isUnlocked = progress >= achievement.unlockThreshold

              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    show: { opacity: 1, scale: 1 },
                  }}
                >
                  <Card className={`bg-white/10 border-white/20 ${isUnlocked ? "bg-opacity-20" : "bg-opacity-5"}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Icon className={`h-5 w-5 ${isUnlocked ? "text-yellow-400" : "text-white"}`} />
                        <span>{achievement.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-white/60">{achievement.description}</p>
                      <div className="space-y-2">
                        <Progress value={progress} />
                        <p className="text-sm text-white/60 text-right">{Math.round(progress)}%</p>
                      </div>
                      {isUnlocked && <p className="text-yellow-400 font-semibold">Achievement Unlocked!</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <p className="text-white">Please sign in to view your achievements.</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

const achievements: Achievement[] = [
  {
    icon: Award,
    title: "First Steps",
    description: "Create your first habit",
    calculateProgress: (habits) => Math.min(habits.length, 1) * 100,
    unlockThreshold: 100,
  },
  {
    icon: Zap,
    title: "Streak Master",
    description: "Maintain a 7-day streak",
    calculateProgress: (habits) => Math.min((Math.max(...habits.map((h) => h.streak), 0) / 7) * 100, 100),
    unlockThreshold: 100,
  },
  {
    icon: Target,
    title: "Goal Crusher",
    description: "Complete all daily habits for a week",
    calculateProgress: (habits) =>
      habits.length > 0 ? Math.min((habits.filter((h) => h.streak >= 7).length / habits.length) * 100, 100) : 0,
    unlockThreshold: 100,
  },
  {
    icon: Flame,
    title: "Habit Champion",
    description: "Maintain 5 habits simultaneously",
    calculateProgress: (habits) => Math.min((habits.length / 5) * 100, 100),
    unlockThreshold: 100,
  },
  {
    icon: Crown,
    title: "Consistency King",
    description: "Complete habits for 30 days straight",
    calculateProgress: (habits) => Math.min((Math.max(...habits.map((h) => h.streak), 0) / 30) * 100, 100),
    unlockThreshold: 100,
  },
  {
    icon: Star,
    title: "Perfect Week",
    description: "Achieve 100% completion for a week",
    calculateProgress: (habits) =>
      habits.length > 0 ? Math.min((habits.filter((h) => h.streak >= 7).length / habits.length) * 100, 100) : 0,
    unlockThreshold: 100,
  },
  {
    icon: TrendingUp,
    title: "Habit Diversity",
    description: "Create habits in 4 different categories",
    calculateProgress: (habits) => Math.min((new Set(habits.map((h) => h.category)).size / 4) * 100, 100),
    unlockThreshold: 100,
  },
  {
    icon: Shield,
    title: "Secure Streak",
    description: "Maintain a habit streak for 14 days while signed in",
    calculateProgress: (habits) =>
      Math.min((Math.max(...habits.filter((h) => h.userId).map((h) => h.streak), 0) / 14) * 100, 100),
    unlockThreshold: 100,
  },
]

