"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Home, ListTodo, Trophy, Settings, UserCircle2 } from "lucide-react"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"

export default function Navigation() {
  const pathname = usePathname()
  const { isSignedIn, user } = useUser()

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/habits", icon: ListTodo, label: "Habits" },
    { href: "/achievements", icon: Trophy, label: "Achievements" },
    { href: "/profile", icon: UserCircle2, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-white">
            <Compass className="h-8 w-8" />
            <span>Habitrix</span>
          </Link>
          <div className="hidden md:flex space-x-4">
            {links.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-white
                  ${pathname === href ? "bg-white/20" : "hover:bg-white/10"}`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-white hover:bg-white/10">
                  <UserCircle2 className="h-5 w-5" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

