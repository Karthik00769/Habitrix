'use client'

import { useEffect } from 'react'
import { useHabits } from '@/contexts/HabitContext'

export function MidnightReset() {
  const {resetCompletedStatus } = useHabits()

  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetCompletedStatus()
      }
    }

    const interval = setInterval(checkMidnight, 60000)

    return () => clearInterval(interval)
  }, [resetCompletedStatus])

  return null
}


