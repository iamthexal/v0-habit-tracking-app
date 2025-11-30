import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HabitDetail } from "@/components/habits/habit-detail"

interface HabitPageProps {
  params: Promise<{ id: string }>
}

export default async function HabitPage({ params }: HabitPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: habit } = await supabase.from("habits").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!habit) {
    notFound()
  }

  const { data: checkins } = await supabase
    .from("checkins")
    .select("*")
    .eq("habit_id", id)
    .order("date", { ascending: false })

  const { data: achievements } = await supabase
    .from("user_achievements")
    .select("*, achievements(*)")
    .eq("habit_id", id)
    .eq("user_id", user.id)

  return <HabitDetail habit={habit} checkins={checkins || []} achievements={achievements || []} />
}
