import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { HabitsOverview } from "@/components/dashboard/habits-overview"
import { QuickCheckin } from "@/components/dashboard/quick-checkin"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatsCards } from "@/components/dashboard/stats-cards"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  // Fetch user's habits
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })

  // Fetch recent check-ins
  const { data: recentCheckins } = await supabase
    .from("checkins")
    .select("*, habits(name, icon, color)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(10)

  // Fetch user achievements count
  const { count: achievementsCount } = await supabase
    .from("user_achievements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="space-y-8">
      <DashboardHeader displayName={profile?.display_name || user.email?.split("@")[0] || "there"} />

      <StatsCards habits={habits || []} checkins={recentCheckins || []} achievementsCount={achievementsCount || 0} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HabitsOverview habits={habits || []} />
          <RecentActivity checkins={recentCheckins || []} />
        </div>
        <div>
          <QuickCheckin habits={habits || []} />
        </div>
      </div>
    </div>
  )
}
