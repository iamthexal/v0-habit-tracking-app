import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // Check if user already completed onboarding
  const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single()

  if (profile?.onboarding_completed) {
    redirect("/dashboard")
  }

  // Fetch preset habits for selection
  const { data: presetHabits } = await supabase.from("preset_habits").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <OnboardingWizard userId={user.id} userEmail={user.email || ""} presetHabits={presetHabits || []} />
    </div>
  )
}
