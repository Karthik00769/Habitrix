"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Palette } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useHabits } from "@/contexts/HabitContext"

const colorThemes = [
  { value: "#4B0082", label: "Indigo" },
  { value: "#800080", label: "Purple" },
  { value: "#008080", label: "Teal" },
  { value: "#4169E1", label: "Royal Blue" },
  { value: "#228B22", label: "Forest Green" },
  { value: "#FF0000", label: "Red" },
  { value: "#00FF00", label: "Green" },
]

export default function Settings() {
  const { user } = useUser()
  const { particleColor, setParticleColor } = useHabits()

  useEffect(() => {
    const storedColor = localStorage.getItem("particleColor")
    if (storedColor) {
      setParticleColor(storedColor)
    }
  }, [])

  const handleColorChange = (color: string) => {
    setParticleColor(color)
    localStorage.setItem("particleColor", color)
  }

  const clearData = () => {
    if (confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      const storedHabits = localStorage.getItem("habits")
      if (storedHabits && user) {
        const parsedHabits = JSON.parse(storedHabits)
        const updatedHabits = parsedHabits.filter((habit: any) => habit.userId !== user.id)
        localStorage.setItem("habits", JSON.stringify(updatedHabits))
      }
      setParticleColor("#4B0082")
      localStorage.setItem("particleColor", "#4B0082")
      console.log("User data cleared")
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Palette className="h-5 w-5" />
              <span>Particle Color</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {colorThemes.map((theme) => (
                <Button
                  key={theme.value}
                  onClick={() => handleColorChange(theme.value)}
                  style={{ backgroundColor: theme.value }}
                  className={`w-8 h-8 rounded-full ${particleColor === theme.value ? "ring-2 ring-white" : ""}`}
                  aria-label={`Change particle color to ${theme.label}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Trash2 className="h-5 w-5" />
              <span>Clear Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={clearData} className="w-full">
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

