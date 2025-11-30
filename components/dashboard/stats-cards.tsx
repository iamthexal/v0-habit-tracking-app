"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Habit, Checkin } from "@/lib/types"
import { Flame, Target, Trophy, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  habits: Habit[]
  checkins: Checkin[]
  achievementsCount: number
}

export function StatsCards({ habits, checkins, achievementsCount }: StatsCardsProps) {
  const activeHabits = habits.filter((h) => h.is_active).length

  // Calculate current best streak from recent checkins
  const today = new Date().toISOString().split("T")[0]
  const todayCheckins = checkins.filter((c) => c.date === today && c.status === "clean").length

  // Calculate total clean days this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekCheckins = checkins.filter((c) => {
    const checkinDate = new Date(c.date)
    return checkinDate >= weekAgo && c.status === "clean"
  }).length

  const stats = [
    {
      label: "Active Habits",
      value: activeHabits,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Today's Check-ins",
      value: todayCheckins,
      icon: Flame,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "This Week",
      value: weekCheckins,
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "Achievements",
      value: achievementsCount,
      icon: Trophy,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
