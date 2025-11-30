import { createClient } from "@/lib/supabase/client"
import type { Achievement, Habit, Checkin } from "@/lib/types"
import { calculateHabitStats } from "./habit-stats"

export async function checkAndUnlockAchievements(
  userId: string,
  habits: Habit[],
  checkins: Checkin[],
): Promise<Achievement[]> {
  const supabase = createClient()
  const newlyUnlocked: Achievement[] = []

  // Fetch all achievements
  const { data: allAchievements } = await supabase.from("achievements").select("*")

  if (!allAchievements) return []

  // Fetch already earned achievements
  const { data: earnedAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId)

  const earnedIds = new Set(earnedAchievements?.map((ea) => ea.achievement_id) || [])

  // Calculate current stats
  let bestStreak = 0
  let longestStreak = 0
  let totalCleanDays = 0
  const activeHabits = habits.filter((h) => h.is_active && !h.is_archived).length
  const totalCheckins = checkins.length

  const habitStats: { habit: Habit; stats: ReturnType<typeof calculateHabitStats> }[] = []

  habits.forEach((habit) => {
    const habitCheckins = checkins.filter((c) => c.habit_id === habit.id)
    const stats = calculateHabitStats(habit, habitCheckins)
    habitStats.push({ habit, stats })
    bestStreak = Math.max(bestStreak, stats.currentStreak)
    longestStreak = Math.max(longestStreak, stats.longestStreak)
    totalCleanDays += stats.totalCleanDays
  })

  // Check each achievement
  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue

    let shouldUnlock = false
    let relatedHabitId: string | null = null

    switch (achievement.requirement_type) {
      case "streak":
        // Check if any habit has this streak
        for (const { habit, stats } of habitStats) {
          if (stats.currentStreak >= achievement.requirement_value) {
            shouldUnlock = true
            relatedHabitId = habit.id
            break
          }
        }
        break

      case "total_days":
        if (totalCleanDays >= achievement.requirement_value) {
          shouldUnlock = true
        }
        break

      case "habits_count":
        if (activeHabits >= achievement.requirement_value) {
          shouldUnlock = true
        }
        break

      case "checkins_count":
        if (totalCheckins >= achievement.requirement_value) {
          shouldUnlock = true
        }
        break
    }

    if (shouldUnlock) {
      // Insert new user achievement
      const { error } = await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievement.id,
        habit_id: relatedHabitId,
      })

      if (!error) {
        newlyUnlocked.push(achievement)
      }
    }
  }

  return newlyUnlocked
}
