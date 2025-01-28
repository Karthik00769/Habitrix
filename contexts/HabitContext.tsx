'use client'

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

interface Habit {
  id: string
  userId: string
  name: string
  category: string
  streak: number
  lastCompleted: string | null
  completedToday: boolean
}

interface HabitContextType {
  habits: Habit[]
  addHabit: (name: string, category: string) => void
  deleteHabit: (id: string) => void
  completeHabit: (id: string) => void
  getTopStreak: () => number
  editHabit: (id: string, newName: string) => void
  resetCompletedStatus: () => void // Added property
  particleColor: string
  setParticleColor: (color: string) => void
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
  const { user } = useUser()
  const [habits, setHabits] = useState<Habit[]>([])
  const [particleColor, setParticleColor] = useState<string>("#4B0082")

  useEffect(() => {
    const storedHabits = localStorage.getItem("habits")
    if (storedHabits && user) {
      const parsedHabits = JSON.parse(storedHabits)
      setHabits(parsedHabits.filter((habit: Habit) => habit.userId === user.id))
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  const addHabit = (name: string, category: string) => {
    if (user) {
      setHabits((prevHabits) => [
        ...prevHabits,
        {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          name,
          category,
          streak: 0,
          lastCompleted: null,
          completedToday: false,
        },
      ])
    }
  }

  const deleteHabit = (id: string) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id))
  }

  const completeHabit = (id: string) => {
    const today = new Date().toISOString().split("T")[0]
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              streak: habit.lastCompleted === today ? habit.streak : habit.streak + 1,
              lastCompleted: today,
              completedToday: true,
            }
          : habit,
      ),
    )
  }

  const getTopStreak = () => {
    return habits.reduce((max, habit) => Math.max(max, habit.streak), 0)
  }

  const editHabit = (id: string, newName: string) => {
    setHabits((prevHabits) => prevHabits.map((habit) => (habit.id === id ? { ...habit, name: newName } : habit)))
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
        addHabit,
        deleteHabit,
        completeHabit,
        getTopStreak,
        editHabit,
        resetCompletedStatus, 
        particleColor,
        setParticleColor,
      }}
    >
      {children}
    </HabitContext.Provider>
  )
}
