"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  displayName: string
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const motivationalQuotes = [
    "Every day is a new opportunity to grow.",
    "Small steps lead to big changes.",
    "You're stronger than your cravings.",
    "Progress, not perfection.",
    "One day at a time.",
    "Your future self will thank you.",
    "You've got this!",
  ]

  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {greeting}, {displayName}!
        </h1>
        <p className="text-muted-foreground mt-1">{quote}</p>
      </div>
      <Button asChild>
        <Link href="/dashboard/habits/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Habit
        </Link>
      </Button>
    </div>
  )
}
