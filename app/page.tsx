'use client'

import { motion } from 'framer-motion'
import { Compass, ListTodo, Trophy, Palette, Navigation, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Compass,
    title: 'About Habitrix',
    description: 'Habitrix is revolutionizing the way we approach personal growth by creating a game-inspired platform to track and master daily habits, empowering users to build better lifestyles.'
  },
  {
    icon: ListTodo,
    title: 'Track Your Habits Efficiently ',
    description: 'Effortlessly monitor and manage your daily habits with custom categories designed for personal goals and productivity.'
  },
  {
    icon: Trophy,
    title: 'Engaging Rewards System ',
    description: 'Stay motivated with game-like achievements and rewards for maintaining habit streaks, making self-improvement fun and rewarding.'
  },
  {
    icon: Palette,
    title: 'Customizable Themes ',
    description: 'Personalize your experience with animated backgrounds and flexible themes, ensuring the interface feels uniquely yours.'
  },
  {
    icon: Navigation,
    title: 'Seamless Navigation ',
    description: 'Navigate intuitively with a sleek design that uses Lucide React icons and a compass-inspired navbar for quick access to all features.'
  },
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To create a fun, visually engaging, and effective platform where users can track, master, and maintain habits, transforming lives one step at a time.'
  }
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
         <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white"> "Hack Your Habits, Master Your Life", </h1>
        <p className="text-xl text-white/80">
          Transform your daily routines into lasting habits with Habitrix
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div key={index} variants={item}>
              <Card className="bg-white/10 border-white/20 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Icon className="h-6 w-6" />
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        )}
      </motion.div>
    </div>
  )
}

