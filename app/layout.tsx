import "./globals.css"
import { Inter } from "next/font/google"
import Navigation from "@/components/Navigation"
import ParticleBackground from "@/components/ParticleBackground"
import { HabitProvider } from "@/contexts/HabitContext"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Habitrix - Hack Your Habits, Master Your Life",
  description: "A modern habit tracking application to help you build better habits",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
        <body className={inter.className} style={{ backgroundColor: "black" }}>
          <HabitProvider>
            <ParticleBackground />
            <Navigation />
            <div className="pt-16">{children}</div>
          </HabitProvider>
        </body>
      </ClerkProvider>
    </html>
  )
}

