'use client'

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRealtime } from "@/hooks/useRealtime"
import { toast } from "sonner"

interface Habit {
  id: string
  userId: string
  name: string
  category: string
  color: string
  streak: number
  lastCompleted: string | null
  completedToday: boolean
}

interface HabitContextType {
  habits: Habit[]
  tokens: number
  achievements: string[]
  addHabit: (name: string, category: string) => Promise<void>
  deleteHabit: (id: string) => void
  completeHabit: (id: string) => Promise<void>
  getTopStreak: () => number
  editHabit: (id: string, newName: string) => void
  resetCompletedStatus: () => void
  particleColor: string
  setParticleColor: (color: string) => void
  refreshHabits: () => Promise<void>
  loading: boolean
}

const HabitContext = createContext<HabitContextType | undefined>(undefined)

export const useHabits = () => {
  const context = useContext(HabitContext)
  if (!context) {
    throw new Error("useHabits must be used within a HabitProvider")
  }
  return context
}

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSignedIn } = useUser()
  const [habits, setHabits] = useState<Habit[]>([])
  const [tokens, setTokens] = useState<number>(0)
  const [achievements, setAchievements] = useState<string[]>([])
  const [particleColor, setParticleColor] = useState<string>("#4B0082")
  const [loading, setLoading] = useState(false)

  // Fetch habits from API
  const refreshHabits = async () => {
    if (!isSignedIn) return
    
    try {
      const response = await fetch('/api/habits/list', { 
        cache: 'no-store',
        next: { revalidate: 0 }
      })
      
      if (response.ok) {
        const data = await response.json()
        setHabits(data.habits.map((h: any) => ({
          id: h._id,
          userId: user?.id || '',
          name: h.name,
          category: h.color,
          color: h.color,
          streak: h.streak,
          lastCompleted: h.lastCompletedAt,
          completedToday: h.completedToday,
        })))
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    }
  }

  // Fetch tokens
  const refreshTokens = async () => {
    if (!isSignedIn) return
    
    try {
      const response = await fetch('/api/tokens', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setTokens(data.balance)
      }
    } catch (error) {
      console.error('Error fetching tokens:', error)
    }
  }

  // Fetch achievements
  const refreshAchievements = async () => {
    if (!isSignedIn) return
    
    try {
      const response = await fetch('/api/achievements', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setAchievements(data.achievements.map((a: any) => a.name))
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  // Real-time updates via SSE
  useEffect(() => {
    if (!isSignedIn) return

    const es = new EventSource('/api/realtime')

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'habit_completed') {
          // Update UI with real-time data
          setTokens(data.newTokenBalance)
          toast.success(`Habit completed! +${data.newStreak} streak 🔥`)
          refreshHabits()
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error)
      }
    }

    return () => es.close()
  }, [isSignedIn])

  // Initial load and sync user
  useEffect(() => {
    if (isSignedIn) {
      // Sync user data to MongoDB
      fetch('/api/user/sync', { method: 'POST' }).catch(console.error)
      
      // Only fetch if we don't have data yet
      if (habits.length === 0) refreshHabits()
      if (tokens === 0) refreshTokens()
      if (achievements.length === 0) refreshAchievements()
    }
  }, [isSignedIn])

  // Midnight auto-complete and reset
  useEffect(() => {
    const checkMidnight = async () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const timeUntilMidnight = midnight.getTime() - now.getTime()

      setTimeout(async () => {
        // Auto-complete all habits at midnight
        try {
          await fetch('/api/habits/auto-complete', { method: 'POST' })
        } catch (error) {
          console.error('Error auto-completing habits:', error)
        }
        
        resetCompletedStatus()
        await refreshHabits()
        await refreshTokens()
        await refreshAchievements()
        checkMidnight() // Schedule next check
      }, timeUntilMidnight)
    }

    if (isSignedIn) {
      checkMidnight()
    }
  }, [isSignedIn])

  const addHabit = async (name: string, category: string) => {
    if (!isSignedIn) return
    
    setLoading(true)
    try {
      // Map category to color
      const categoryColors: Record<string, string> = {
        'P health': '#10b981',
        'M health': '#a855f7',
        'Social': '#3b82f6',
        'career': '#f97316',
        'personal': '#ec4899',
        'spiritual': '#eab308',
        'others': '#6b7280',
      }
      const color = categoryColors[category] || '#3b82f6'
      
      const response = await fetch('/api/habits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      })

      if (response.ok) {
        toast.success('Habit created! ✨')
        await refreshHabits()
      } else {
        toast.error('Failed to create habit')
      }
    } catch (error) {
      console.error('Error creating habit:', error)
      toast.error('Error creating habit')
    } finally {
      setLoading(false)
    }
  }

  const deleteHabit = async (id: string) => {
    if (!isSignedIn) return
    
    try {
      const response = await fetch(`/api/habits/delete?habitId=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id))
        toast.success('Habit deleted')
      } else {
        toast.error('Failed to delete habit')
      }
    } catch (error) {
      console.error('Error deleting habit:', error)
      toast.error('Error deleting habit')
    }
  }

  const completeHabit = async (id: string) => {
    if (!isSignedIn) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/habits/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId: id }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Show achievement notifications
        if (data.achievementsUnlocked && data.achievementsUnlocked.length > 0) {
          data.achievementsUnlocked.forEach((achievement: string) => {
            toast.success(`🏆 Achievement: ${achievement}!`)
          })
        }
        
        // Refresh data (SSE will also trigger updates)
        await refreshHabits()
        await refreshTokens()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to complete habit')
      }
    } catch (error) {
      console.error('Error completing habit:', error)
      toast.error('Error completing habit')
    } finally {
      setLoading(false)
    }
  }

  const getTopStreak = () => {
    return habits.reduce((max, habit) => Math.max(max, habit.streak), 0)
  }

  const editHabit = async (id: string, newName: string) => {
    if (!isSignedIn) return
    
    try {
      const response = await fetch('/api/habits/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId: id, name: newName }),
      })

      if (response.ok) {
        setHabits((prevHabits) => prevHabits.map((habit) => (habit.id === id ? { ...habit, name: newName } : habit)))
        toast.success('Habit updated')
      } else {
        toast.error('Failed to update habit')
      }
    } catch (error) {
      console.error('Error updating habit:', error)
      toast.error('Error updating habit')
    }
  }

  const resetCompletedStatus = () => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => ({
        ...habit,
        completedToday: false,
      })),
    )
  }

  return (
    <HabitContext.Provider
      value={{
        habits,
        tokens,
        achievements,
        addHabit,
        deleteHabit,
        completeHabit,
        getTopStreak,
        editHabit,
        resetCompletedStatus,
        particleColor,
        setParticleColor,
        refreshHabits,
        loading,
      }}
    >
      {children}
    </HabitContext.Provider>
  )
}
