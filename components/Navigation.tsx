"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Home, ListTodo, Trophy, Settings, UserCircle2, Menu, X } from "lucide-react"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Navigation() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)

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
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-white">
            <Compass className="h-8 w-8" />
            <span>Habitrix</span>
          </Link>

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              className="text-white p-2 rounded-md"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}

          {/* Desktop Navigation */}
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

      {/* Mobile Sidebar */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 p-5 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300`}
      >
        <h2 className="text-xl font-bold mb-4">Habitrix</h2>
        <ul className="space-y-4">
          {links.map(({ href, icon: Icon, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}


