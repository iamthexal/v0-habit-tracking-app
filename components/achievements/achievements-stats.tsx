"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Habit, Checkin } from "@/lib/types"
import { Trophy, Star, Target, Flame } from "lucide-react"
import { calculateHabitStats } from "@/lib/utils/habit-stats"

interface AchievementsStatsProps {
  totalAchievements: number
  earnedAchievements: number
  habits: Habit[]
  checkins: Checkin[]
}

export function AchievementsStats({ totalAchievements, earnedAchievements, habits, checkins }: AchievementsStatsProps) {
  const completionPercentage = totalAchievements > 0 ? Math.round((earnedAchievements / totalAchievements) * 100) : 0

  // Calculate best current streak across all habits
  let bestCurrentStreak = 0
  let totalCleanDays = 0

  habits.forEach((habit) => {
    const habitCheckins = checkins.filter((c) => c.habit_id === habit.id)
    const stats = calculateHabitStats(habit, habitCheckins)
    bestCurrentStreak = Math.max(bestCurrentStreak, stats.currentStreak)
    totalCleanDays += stats.totalCleanDays
  })

  const stats = [
    {
      label: "Achievements Earned",
      value: `${earnedAchievements}/${totalAchievements}`,
      icon: Trophy,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Completion",
      value: `${completionPercentage}%`,
      icon: Star,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      label: "Best Current Streak",
      value: `${bestCurrentStreak} days`,
      icon: Flame,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Clean Days",
      value: totalCleanDays,
      icon: Target,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
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
                  <p className="text-2xl font-bold">{stat.value}</p>
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
