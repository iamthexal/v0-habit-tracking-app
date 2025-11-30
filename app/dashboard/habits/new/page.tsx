import { createClient } from "@/lib/supabase/server"
import { HabitForm } from "@/components/habits/habit-form"

export default async function NewHabitPage() {
  const supabase = await createClient()

  // Fetch preset habits
  const { data: presetHabits } = await supabase.from("preset_habits").select("*").order("name", { ascending: true })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Add New Habit</h1>
        <p className="text-muted-foreground mt-1">Choose from templates or create a custom habit.</p>
      </div>

      <HabitForm presetHabits={presetHabits || []} />
    </div>
  )
}
