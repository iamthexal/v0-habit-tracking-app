import type { Checkin, Habit } from "@/lib/types"

export interface HabitStats {
  currentStreak: number
  longestStreak: number
  totalCleanDays: number
  totalIndulgences: number
  indulgencesThisPeriod: number
  isWithinAllowedIndulgences: boolean
  completionRate: number
  lastCheckin: Checkin | null
}

export function calculateHabitStats(habit: Habit, checkins: Checkin[]): HabitStats {
  // Sort checkins by date descending
  const sortedCheckins = [...checkins].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const lastCheckin = sortedCheckins[0] || null

  // Calculate streaks
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let totalCleanDays = 0
  let totalIndulgences = 0

  // Sort by date ascending for streak calculation
  const ascendingCheckins = [...checkins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  for (const checkin of ascendingCheckins) {
    if (checkin.status === "clean") {
      tempStreak++
      totalCleanDays++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else if (checkin.status === "indulged") {
      totalIndulgences++
      // Indulgences within allowed frequency don't break the streak
      if (habit.habit_type === "reduce" && habit.allowed_frequency) {
        // Continue streak for reduce-type habits with allowed indulgences
        totalCleanDays++
      } else {
        // For quit-type habits, indulgence breaks the streak
        tempStreak = 0
      }
    } else {
      // Relapse always breaks the streak
      tempStreak = 0
    }
  }

  currentStreak = tempStreak

  // Calculate indulgences this period
  const now = new Date()
  let periodStart: Date

  switch (habit.frequency_period) {
    case "day":
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case "week":
      const dayOfWeek = now.getDay()
      periodStart = new Date(now)
      periodStart.setDate(now.getDate() - dayOfWeek)
      periodStart.setHours(0, 0, 0, 0)
      break
    case "month":
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    default:
      periodStart = new Date(habit.start_date)
  }

  const indulgencesThisPeriod = checkins.filter(
    (c) => c.status === "indulged" && new Date(c.date) >= periodStart,
  ).length

  const isWithinAllowedIndulgences = habit.allowed_frequency
    ? indulgencesThisPeriod < habit.allowed_frequency
    : totalIndulgences === 0

  // Calculate completion rate
  const startDate = new Date(habit.start_date)
  const daysSinceStart = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const completionRate = daysSinceStart > 0 ? Math.round((totalCleanDays / daysSinceStart) * 100) : 0

  return {
    currentStreak,
    longestStreak,
    totalCleanDays,
    totalIndulgences,
    indulgencesThisPeriod,
    isWithinAllowedIndulgences,
    completionRate,
    lastCheckin,
  }
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your journey today!"
  if (streak === 1) return "Great start! Keep it going!"
  if (streak < 7) return `${streak} days strong!`
  if (streak < 14) return `One week milestone passed!`
  if (streak < 30) return `${streak} days - You're unstoppable!`
  if (streak < 90) return `${streak} days - A full month and counting!`
  if (streak < 180) return `${streak} days - Incredible dedication!`
  if (streak < 365) return `${streak} days - Life-changing progress!`
  return `${streak} days - You're a legend!`
}

export function formatStreak(days: number): string {
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""}`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    const remainingDays = days % 7
    return remainingDays > 0 ? `${weeks}w ${remainingDays}d` : `${weeks} week${weeks !== 1 ? "s" : ""}`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    return remainingDays > 0 ? `${months}mo ${remainingDays}d` : `${months} month${months !== 1 ? "s" : ""}`
  }
  const years = Math.floor(days / 365)
  const remainingDays = days % 365
  return remainingDays > 0 ? `${years}y ${remainingDays}d` : `${years} year${years !== 1 ? "s" : ""}`
}
