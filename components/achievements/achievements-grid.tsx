"use client"

import { useState, useMemo } from "react"
import type { Achievement, UserAchievement, Habit, Checkin } from "@/lib/types"
import { calculateHabitStats } from "@/lib/utils/habit-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lock, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AchievementsGridProps {
  achievements: Achievement[]
  userAchievements: (UserAchievement & {
    achievements: Achievement | null
    habits: { name: string; icon: string } | null
  })[]
  habits: Habit[]
  checkins: Checkin[]
}

const tierColors = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-cyan-300 to-cyan-500",
  diamond: "from-blue-400 to-purple-500",
}

const tierBgColors = {
  bronze: "bg-amber-500/10",
  silver: "bg-gray-400/10",
  gold: "bg-yellow-500/10",
  platinum: "bg-cyan-400/10",
  diamond: "bg-blue-500/10",
}

export function AchievementsGrid({ achievements, userAchievements, habits, checkins }: AchievementsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const earnedIds = useMemo(() => new Set(userAchievements.map((ua) => ua.achievement_id)), [userAchievements])

  // Calculate current progress for each achievement type
  const progressData = useMemo(() => {
    let bestStreak = 0
    let totalCleanDays = 0
    const totalCheckins = checkins.length
    const activeHabits = habits.filter((h) => h.is_active && !h.is_archived).length

    habits.forEach((habit) => {
      const habitCheckins = checkins.filter((c) => c.habit_id === habit.id)
      const stats = calculateHabitStats(habit, habitCheckins)
      bestStreak = Math.max(bestStreak, stats.currentStreak)
      totalCleanDays += stats.totalCleanDays
    })

    return {
      streak: bestStreak,
      total_days: totalCleanDays,
      habits_count: activeHabits,
      checkins_count: totalCheckins,
    }
  }, [habits, checkins])

  const getProgress = (achievement: Achievement) => {
    const current = progressData[achievement.requirement_type as keyof typeof progressData] || 0
    const target = achievement.requirement_value
    return Math.min((current / target) * 100, 100)
  }

  const categories = [
    { value: "all", label: "All" },
    { value: "streak", label: "Streaks" },
    { value: "progress", label: "Progress" },
    { value: "habits", label: "Habits" },
    { value: "engagement", label: "Engagement" },
  ]

  const filteredAchievements = achievements.filter((a) => selectedCategory === "all" || a.category === selectedCategory)

  // Group by tier
  const achievementsByTier = {
    bronze: filteredAchievements.filter((a) => a.tier === "bronze"),
    silver: filteredAchievements.filter((a) => a.tier === "silver"),
    gold: filteredAchievements.filter((a) => a.tier === "gold"),
    platinum: filteredAchievements.filter((a) => a.tier === "platinum"),
    diamond: filteredAchievements.filter((a) => a.tier === "diamond"),
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="px-4">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Recently Earned */}
      {userAchievements.length > 0 && selectedCategory === "all" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recently Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {userAchievements.slice(0, 5).map((ua) => (
                <div
                  key={ua.id}
                  className={cn(
                    "flex-shrink-0 w-32 p-4 rounded-xl text-center",
                    tierBgColors[ua.achievements?.tier as keyof typeof tierBgColors],
                  )}
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl bg-gradient-to-br",
                      tierColors[ua.achievements?.tier as keyof typeof tierColors],
                    )}
                  >
                    {ua.achievements?.icon}
                  </div>
                  <p className="font-medium text-sm truncate">{ua.achievements?.name}</p>
                  {ua.habits && (
                    <p className="text-xs text-muted-foreground truncate">
                      {ua.habits.icon} {ua.habits.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Tiers */}
      {(["bronze", "silver", "gold", "platinum", "diamond"] as const).map((tier) => {
        const tierAchievements = achievementsByTier[tier]
        if (tierAchievements.length === 0) return null

        return (
          <Card key={tier}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className={cn("h-6 w-6 rounded-full bg-gradient-to-br", tierColors[tier])} />
                <CardTitle className="text-lg capitalize">{tier} Tier</CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  {tierAchievements.filter((a) => earnedIds.has(a.id)).length}/{tierAchievements.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tierAchievements.map((achievement) => {
                  const isEarned = earnedIds.has(achievement.id)
                  const progress = getProgress(achievement)

                  return (
                    <div
                      key={achievement.id}
                      className={cn(
                        "relative p-4 rounded-xl border transition-all",
                        isEarned ? tierBgColors[tier] : "bg-muted/20 opacity-70",
                      )}
                    >
                      {isEarned && (
                        <div className="absolute top-2 right-2">
                          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                            isEarned ? `bg-gradient-to-br ${tierColors[tier]}` : "bg-muted",
                          )}
                        >
                          {isEarned ? achievement.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                        </div>
                      </div>

                      {!isEarned && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
