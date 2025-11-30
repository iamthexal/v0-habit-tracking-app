import { createClient } from "@/lib/supabase/server"
import { SettingsPage } from "@/components/settings/settings-page"

export default async function Settings() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*, habits(name, icon)")
    .eq("user_id", user.id)
    .order("reminder_time", { ascending: true })

  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, icon")
    .eq("user_id", user.id)
    .eq("is_archived", false)

  return <SettingsPage user={user} profile={profile} reminders={reminders || []} habits={habits || []} />
}
