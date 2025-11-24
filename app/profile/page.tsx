"use client"

import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHabits } from "@/contexts/HabitContext"

export default function Profile() {
  const { user } = useUser()
  const { habits, tokens, achievements, getTopStreak } = useHabits()

  if (!user) {
    return <div className="text-white">Please sign in to view your profile.</div>
  }

  const totalCompletions = habits.reduce((sum, h) => sum + (h.completedToday ? 1 : 0), 0)

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{user.fullName || user.username}</p>
                <p className="text-white/60">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-white">{habits.length}</p>
              <p className="text-white/80 text-sm mt-2">Total Habits</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-white">{getTopStreak()}</p>
              <p className="text-white/80 text-sm mt-2">Best Streak 🔥</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-white">{tokens}</p>
              <p className="text-white/80 text-sm mt-2">Tokens 🪙</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-white">{achievements.length}</p>
              <p className="text-white/80 text-sm mt-2">Achievements 🏆</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Completed Today</span>
              <span className="text-white font-semibold">{totalCompletions} habits</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Active Habits</span>
              <span className="text-white font-semibold">{habits.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Longest Streak</span>
              <span className="text-white font-semibold">{getTopStreak()} days</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

