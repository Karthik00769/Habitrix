"use client"

import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHabits } from "@/contexts/HabitContext"

export default function Profile() {
  const { user } = useUser()
  const { habits, getTopStreak } = useHabits()

  if (!user) {
    return <div className="text-white">Please sign in to view your profile.</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">User Information</CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            <p>Name: {user.fullName}</p>
            <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Habit Statistics</CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            <p>Total Habits: {habits.length}</p>
            <p>Top Streak: {getTopStreak()}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

