"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHabits } from "@/contexts/HabitContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useUser } from "@clerk/nextjs"

export default function Habits() {
  const { habits, addHabit, deleteHabit, editHabit, completeHabit } = useHabits()
  const [newHabit, setNewHabit] = useState("")
  const [category, setCategory] = useState("")
  const [editingHabit, setEditingHabit] = useState<{ id: string; name: string } | null>(null)
  const { user } = useUser()

  const handleAddHabit = () => {
    if (!newHabit || !category || !user) return
    addHabit(newHabit, category)
    setNewHabit("")
    setCategory("")
  }

  const handleEditHabit = () => {
    if (editingHabit) {
      editHabit(editingHabit.id, editingHabit.name)
      setEditingHabit(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Daily Habits</h1>

        <Card className="bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Enter a new habit"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                className="bg-white/5 text-white"
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white/5 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P health">Physical Health</SelectItem>
                  <SelectItem value="M health">Mental Health</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddHabit} disabled={!newHabit || !category || !user}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <motion.div
          className="grid gap-4"
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
          {user ? (
            habits.map((habit) => (
              <motion.div
                key={habit.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 },
                }}
              >
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span>{habit.name}</span>
                      <span className="text-sm">Streak: {habit.streak}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <span className="text-white/60 capitalize">{habit.category}</span>
                    <div className="space-x-2">
                      <Button
                        variant={habit.completedToday ? "secondary" : "outline"}
                        onClick={() => completeHabit(habit.id)}
                        disabled={habit.completedToday}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {habit.completedToday ? "Completed" : "Complete"}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            onClick={() => setEditingHabit({ id: habit.id, name: habit.name })}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white/10 border-white/20">
                          <DialogHeader>
                            <DialogTitle className="text-white">Edit Habit</DialogTitle>
                          </DialogHeader>
                          <Input
                            value={editingHabit?.name || ""}
                            onChange={(e) =>
                              setEditingHabit((prev) => (prev ? { ...prev, name: e.target.value } : null))
                            }
                            className="bg-white/5 text-white"
                          />
                          <Button onClick={handleEditHabit}>Save Changes</Button>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" onClick={() => deleteHabit(habit.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <p className="text-white">Please sign in to view and manage your habits.</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

