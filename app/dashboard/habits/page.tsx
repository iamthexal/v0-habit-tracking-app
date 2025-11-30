import { createClient } from "@/lib/supabase/server"
import { HabitsList } from "@/components/habits/habits-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function HabitsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch check-ins for each habit
  const habitsWithCheckins = await Promise.all(
    (habits || []).map(async (habit) => {
      const { data: checkins } = await supabase
        .from("checkins")
        .select("*")
        .eq("habit_id", habit.id)
        .order("date", { ascending: false })

      return { habit, checkins: checkins || [] }
    }),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Your Habits</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your habits in one place.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/habits/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Habit
          </Link>
        </Button>
      </div>

      <HabitsList habitsWithCheckins={habitsWithCheckins} />
    </div>
  )
}
