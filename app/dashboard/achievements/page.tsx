import { createClient } from "@/lib/supabase/server"
import { AchievementsGrid } from "@/components/achievements/achievements-grid"
import { AchievementsStats } from "@/components/achievements/achievements-stats"

export default async function AchievementsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all achievements
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("requirement_value", { ascending: true })

  // Fetch user's earned achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("*, achievements(*), habits(name, icon)")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: false })

  // Fetch user's habits for progress calculation
  const { data: habits } = await supabase.from("habits").select("*").eq("user_id", user.id).eq("is_archived", false)

  // Fetch all checkins for stats
  const { data: checkins } = await supabase.from("checkins").select("*").eq("user_id", user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground mt-1">Celebrate your milestones and track your progress.</p>
      </div>

      <AchievementsStats
        totalAchievements={achievements?.length || 0}
        earnedAchievements={userAchievements?.length || 0}
        habits={habits || []}
        checkins={checkins || []}
      />

      <AchievementsGrid
        achievements={achievements || []}
        userAchievements={userAchievements || []}
        habits={habits || []}
        checkins={checkins || []}
      />
    </div>
  )
}
