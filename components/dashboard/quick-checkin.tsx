"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Habit, Achievement } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, X, AlertCircle, Loader2 } from "lucide-react"
import { checkAndUnlockAchievements } from "@/lib/utils/check-achievements"
import { AchievementToast } from "@/components/achievements/achievement-toast"

interface QuickCheckinProps {
  habits: Habit[]
}

export function QuickCheckin({ habits }: QuickCheckinProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const router = useRouter()
  const activeHabits = habits.filter((h) => h.is_active)
  const today = new Date().toISOString().split("T")[0]

  const handleCheckin = async (habitId: string, status: "clean" | "indulged" | "relapse") => {
    setLoading(habitId)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Check if already checked in today
      const { data: existing } = await supabase
        .from("checkins")
        .select("id")
        .eq("habit_id", habitId)
        .eq("date", today)
        .single()

      if (existing) {
        // Update existing check-in
        const { error } = await supabase.from("checkins").update({ status }).eq("id", existing.id)

        if (error) throw error
        toast.success("Check-in updated!")
      } else {
        // Create new check-in
        const { error } = await supabase.from("checkins").insert({
          habit_id: habitId,
          user_id: user.id,
          date: today,
          status,
        })

        if (error) throw error
        toast.success(
          status === "clean"
            ? "Great job staying on track!"
            : status === "indulged"
              ? "Logged. Remember, occasional indulgences are okay!"
              : "Logged. Tomorrow is a new day!",
        )
      }

      if (status === "clean") {
        const { data: allHabits } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_archived", false)

        const { data: allCheckins } = await supabase.from("checkins").select("*").eq("user_id", user.id)

        if (allHabits && allCheckins) {
          const newAchievements = await checkAndUnlockAchievements(user.id, allHabits, allCheckins)

          if (newAchievements.length > 0) {
            setUnlockedAchievement(newAchievements[0])
          }
        }
      }

      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to check in")
    } finally {
      setLoading(null)
    }
  }

  if (activeHabits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Add habits to start checking in</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeHabits.slice(0, 5).map((habit) => (
            <div key={habit.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{habit.icon}</span>
                <span className="font-medium text-sm flex-1">{habit.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-9 text-xs gap-1 hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/50 bg-transparent"
                  onClick={() => handleCheckin(habit.id, "clean")}
                  disabled={loading === habit.id}
                >
                  {loading === habit.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Clean
                </Button>
                {habit.habit_type === "reduce" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 text-xs gap-1 hover:bg-yellow-500/10 hover:text-yellow-600 hover:border-yellow-500/50 bg-transparent"
                    onClick={() => handleCheckin(habit.id, "indulged")}
                    disabled={loading === habit.id}
                  >
                    {loading === habit.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    Indulged
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-9 text-xs gap-1 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/50 bg-transparent"
                  onClick={() => handleCheckin(habit.id, habit.habit_type === "quit" ? "relapse" : "indulged")}
                  disabled={loading === habit.id}
                >
                  {loading === habit.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                  {habit.habit_type === "quit" ? "Slip" : "Skip"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {unlockedAchievement && (
        <AchievementToast achievement={unlockedAchievement} onClose={() => setUnlockedAchievement(null)} />
      )}
    </>
  )
}
