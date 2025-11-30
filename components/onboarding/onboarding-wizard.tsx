"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Check, ChevronRight, Sparkles, Target, Trophy, ArrowLeft, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface PresetHabit {
  id: string
  name: string
  description: string
  category: "addiction" | "habit"
  habit_type: "quit" | "reduce" | "build"
  icon: string
  color: string
  suggested_frequency: number | null
  frequency_period: string | null
  tips: string[]
}

interface OnboardingWizardProps {
  userId: string
  userEmail: string
  presetHabits: PresetHabit[]
}

const STEPS = [
  { id: 1, title: "Welcome", description: "Let's get started" },
  { id: 2, title: "Profile", description: "Tell us about yourself" },
  { id: 3, title: "Goals", description: "What do you want to change?" },
  { id: 4, title: "Ready", description: "You're all set!" },
]

export function OnboardingWizard({ userId, userEmail, presetHabits }: OnboardingWizardProps) {
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Profile data
  const [displayName, setDisplayName] = useState(userEmail.split("@")[0])

  // Selected habits
  const [selectedHabits, setSelectedHabits] = useState<{ id: string; startDate: Date }[]>([])

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  const addictionHabits = presetHabits.filter((h) => h.category === "addiction")
  const positiveHabits = presetHabits.filter((h) => h.category === "habit")

  const toggleHabit = (habitId: string) => {
    setSelectedHabits((prev) => {
      const existing = prev.find((h) => h.id === habitId)
      if (existing) {
        return prev.filter((h) => h.id !== habitId)
      }
      return [...prev, { id: habitId, startDate: new Date() }]
    })
  }

  const updateStartDate = (habitId: string, date: Date) => {
    setSelectedHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, startDate: date } : h)))
  }

  const isHabitSelected = (habitId: string) => selectedHabits.some((h) => h.id === habitId)

  const getHabitStartDate = (habitId: string) => selectedHabits.find((h) => h.id === habitId)?.startDate

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (profileError) throw profileError

      // Create selected habits
      if (selectedHabits.length > 0) {
        const habitsToCreate = selectedHabits.map((selected) => {
          const preset = presetHabits.find((h) => h.id === selected.id)!
          return {
            user_id: userId,
            name: preset.name,
            category: preset.category,
            habit_type: preset.habit_type,
            icon: preset.icon,
            color: preset.color,
            allowed_frequency: preset.suggested_frequency,
            frequency_period: preset.frequency_period,
            start_date: selected.startDate.toISOString().split("T")[0],
            is_archived: false,
          }
        })

        const { error: habitsError } = await supabase.from("habits").insert(habitsToCreate)

        if (habitsError) throw habitsError
      }

      toast.success("Welcome aboard! Let's start your journey.")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Onboarding error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 md:py-16">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-sm font-medium">{STEPS[currentStep - 1].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && <WelcomeStep onNext={handleNext} />}

        {currentStep === 2 && (
          <ProfileStep
            displayName={displayName}
            setDisplayName={setDisplayName}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <GoalsStep
            addictionHabits={addictionHabits}
            positiveHabits={positiveHabits}
            selectedHabits={selectedHabits}
            toggleHabit={toggleHabit}
            updateStartDate={updateStartDate}
            isHabitSelected={isHabitSelected}
            getHabitStartDate={getHabitStartDate}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <ReadyStep
            displayName={displayName}
            selectedCount={selectedHabits.length}
            isLoading={isLoading}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl">Welcome to HabitFlow</CardTitle>
        <CardDescription className="text-base mt-2">
          Your personal companion for building better habits and breaking free from the ones holding you back.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4">
          <FeatureItem
            icon={<Target className="h-5 w-5 text-primary" />}
            title="Track Your Progress"
            description="Monitor your streaks, view detailed statistics, and celebrate your wins."
          />
          <FeatureItem
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
            title="Earn Achievements"
            description="Unlock badges as you hit milestones and build momentum."
          />
          <FeatureItem
            icon={<Sparkles className="h-5 w-5 text-purple-500" />}
            title="Flexible Tracking"
            description="Allow occasional indulgences without losing all your progress."
          />
        </div>

        <Button onClick={onNext} className="w-full" size="lg">
          Get Started
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start p-4 rounded-lg bg-muted/50">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ProfileStep({
  displayName,
  setDisplayName,
  onNext,
  onBack,
}: {
  displayName: string
  setDisplayName: (name: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">What should we call you?</CardTitle>
        <CardDescription>This is how you'll appear in the app.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            className="text-lg h-12"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onNext} className="flex-1" disabled={!displayName.trim()}>
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function GoalsStep({
  addictionHabits,
  positiveHabits,
  selectedHabits,
  toggleHabit,
  updateStartDate,
  isHabitSelected,
  getHabitStartDate,
  onNext,
  onBack,
}: {
  addictionHabits: PresetHabit[]
  positiveHabits: PresetHabit[]
  selectedHabits: { id: string; startDate: Date }[]
  toggleHabit: (id: string) => void
  updateStartDate: (id: string, date: Date) => void
  isHabitSelected: (id: string) => boolean
  getHabitStartDate: (id: string) => Date | undefined
  onNext: () => void
  onBack: () => void
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">What would you like to work on?</CardTitle>
        <CardDescription>Select habits you want to track. You can always add more later.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Addictions Section */}
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-3">Habits to Break</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {addictionHabits.map((habit) => (
              <HabitChip
                key={habit.id}
                habit={habit}
                isSelected={isHabitSelected(habit.id)}
                onToggle={() => toggleHabit(habit.id)}
              />
            ))}
          </div>
        </div>

        {/* Positive Habits Section */}
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-3">Habits to Build</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {positiveHabits.map((habit) => (
              <HabitChip
                key={habit.id}
                habit={habit}
                isSelected={isHabitSelected(habit.id)}
                onToggle={() => toggleHabit(habit.id)}
              />
            ))}
          </div>
        </div>

        {/* Selected habits with start date pickers */}
        {selectedHabits.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="font-medium text-sm text-muted-foreground">When did you start?</h3>
            <div className="space-y-2">
              {selectedHabits.map((selected) => {
                const habit = [...addictionHabits, ...positiveHabits].find((h) => h.id === selected.id)
                if (!habit) return null
                return (
                  <div
                    key={selected.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.icon}</span>
                      <span className="font-medium text-sm">{habit.name}</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "justify-start text-left font-normal",
                            !selected.startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selected.startDate, "MMM d, yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selected.startDate}
                          onSelect={(date) => date && updateStartDate(selected.id, date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Set the date you started (or want to start) tracking each habit
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onNext} className="flex-1">
            {selectedHabits.length === 0 ? "Skip for now" : "Continue"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function HabitChip({
  habit,
  isSelected,
  onToggle,
}: {
  habit: PresetHabit
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
      )}
    >
      <span className="text-xl">{habit.icon}</span>
      <span className="text-sm font-medium truncate">{habit.name}</span>
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </button>
  )
}

function ReadyStep({
  displayName,
  selectedCount,
  isLoading,
  onComplete,
  onBack,
}: {
  displayName: string
  selectedCount: number
  isLoading: boolean
  onComplete: () => void
  onBack: () => void
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <CardTitle className="text-2xl">You're all set, {displayName}!</CardTitle>
        <CardDescription className="text-base mt-2">
          Your journey starts now. Remember, every day is a new opportunity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Habits to track</span>
            <Badge variant="secondary">{selectedCount || "None yet"}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Starting streak</span>
            <Badge variant="secondary">Day 1</Badge>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-center">
            <span className="font-medium">Pro tip:</span> Check in daily, even on tough days. Honesty with yourself is
            the first step to real change.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent" disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onComplete} className="flex-1" disabled={isLoading}>
            {isLoading ? "Setting up..." : "Go to Dashboard"}
            {!isLoading && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
