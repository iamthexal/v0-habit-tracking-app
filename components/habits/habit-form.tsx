{
type: uploaded file
fileName: iamthexal/v0-habit-tracking-app/v0-habit-tracking-app-e64391ab4955e5c244ae7cfbf2205de366211492/components/habits/habit-form.tsx
fullContent:
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { PresetHabit } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { Loader2, Sparkles, Pencil, CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface HabitFormProps {
  presetHabits: PresetHabit[]
}

const ICONS = [
  "🎯",
  "💪",
  "🏃",
  "🧘",
  "📖",
  "💧",
  "😴",
  "🥗",
  "🚬",
  "🍺",
  "☕",
  "🍬",
  "📱",
  "🎮",
  "💊",
  "🎨",
  "🎵",
  "✨",
  "🌟",
  "🔥",
]
const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
]

export function HabitForm({ presetHabits }: HabitFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetHabit | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"addiction" | "habit">("addiction")
  const [habitType, setHabitType] = useState<"quit" | "reduce" | "build">("quit")
  const [icon, setIcon] = useState("🎯")
  const [color, setColor] = useState("#10b981")
  const [allowedFrequency, setAllowedFrequency] = useState<number | null>(null)
  const [frequencyPeriod, setFrequencyPeriod] = useState<"day" | "week" | "month">("week")
  
  // Date and Time state
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState("00:00")

  const handlePresetSelect = (preset: PresetHabit) => {
    setSelectedPreset(preset)
    setName(preset.name)
    setDescription(preset.description || "")
    setCategory(preset.category)
    setHabitType(preset.habit_type)
    setIcon(preset.icon)
    setColor(preset.color)
    setAllowedFrequency(preset.suggested_frequency)
    setFrequencyPeriod(preset.frequency_period || "week")
    setStartDate(new Date())
    setStartTime("00:00")
  }

  // Helper to format date as YYYY-MM-DD for DB comparisons
  const formatLocalYMD = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Combine date and time
      const fullStartDateTime = new Date(startDate)
      const [hours, minutes] = startTime.split(":").map(Number)
      fullStartDateTime.setHours(hours, minutes, 0, 0)

      // 1. Create the habit
      const { data: newHabit, error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          category,
          habit_type: habitType,
          icon,
          color,
          // Send full ISO string to TIMESTAMPTZ column
          start_date: fullStartDateTime.toISOString(),
          allowed_frequency: habitType === "reduce" ? allowedFrequency : null,
          frequency_period: habitType === "reduce" ? frequencyPeriod : null,
          is_active: true,
          is_archived: false,
        })
        .select()
        .single()

      if (error) throw error

      // 2. Backfill check-ins if start date is in the past
      const today = new Date()
      const todayStr = formatLocalYMD(today)
      const startDateStr = formatLocalYMD(startDate)

      // Only backfill if the start DATE is strictly before today's DATE
      if (startDateStr < todayStr) {
        const checkinsToCreate = []
        const cursorDate = new Date(startDate)
        
        // Loop from start date up to yesterday (exclusive of today)
        while (formatLocalYMD(cursorDate) < todayStr) {
          checkinsToCreate.push({
            habit_id: newHabit.id,
            user_id: user.id,
            date: formatLocalYMD(cursorDate),
            status: "clean", // Assume success for past days
          })
          
          // Move to next day
          cursorDate.setDate(cursorDate.getDate() + 1)
        }

        if (checkinsToCreate.length > 0) {
          const { error: backfillError } = await supabase
            .from("checkins")
            .insert(checkinsToCreate)

          if (backfillError) {
            console.error("Error backfilling history:", backfillError)
            toast.error("Habit created, but failed to save past history.")
          } else {
            toast.success(`Habit created with ${checkinsToCreate.length} days of history!`)
            router.push("/dashboard/habits")
            router.refresh()
            return
          }
        }
      }

      toast.success("Habit created successfully!")
      router.push("/dashboard/habits")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create habit")
    } finally {
      setIsLoading(false)
    }
  }

  // Group presets by category
  const addictionPresets = presetHabits.filter((p) => p.category === "addiction")
  const habitPresets = presetHabits.filter((p) => p.category === "habit")

  return (
    <Tabs defaultValue="templates">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="templates" className="gap-2">
          <Sparkles className="h-4 w-4" />
          From Template
        </TabsTrigger>
        <TabsTrigger value="custom" className="gap-2">
          <Pencil className="h-4 w-4" />
          Custom
        </TabsTrigger>
      </TabsList>

      <TabsContent value="templates" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Addictions to Quit/Reduce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {addictionPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-3 rounded-lg border text-left transition-all hover:border-primary hover:bg-primary/5 ${
                    selectedPreset?.id === preset.id ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <p className="font-medium text-sm mt-1">{preset.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{preset.habit_type}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Habits to Build</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {habitPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-3 rounded-lg border text-left transition-all hover:border-primary hover:bg-primary/5 ${
                    selectedPreset?.id === preset.id ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <p className="font-medium text-sm mt-1">{preset.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{preset.habit_type}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedPreset && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{selectedPreset.icon}</span>
                {selectedPreset.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPreset.description && <p className="text-muted-foreground">{selectedPreset.description}</p>}

              {selectedPreset.tips && selectedPreset.tips.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Tips for success:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedPreset.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPreset.habit_type === "reduce" && selectedPreset.suggested_frequency && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Suggested limit:</span>
                  <span className="font-medium">
                    {selectedPreset.suggested_frequency}x per {selectedPreset.frequency_period}
                  </span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                When did you start (or want to start) tracking this habit?
              </p>

              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Start Tracking This Habit"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="custom" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Habit Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Quit Smoking, Drink More Water"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Why is this habit important to you?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="addiction">Addiction to break</SelectItem>
                      <SelectItem value="habit">Habit to build</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Goal Type</Label>
                  <Select value={habitType} onValueChange={(v) => setHabitType(v as typeof habitType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quit">Quit completely</SelectItem>
                      <SelectItem value="reduce">Reduce frequency</SelectItem>
                      <SelectItem value="build">Build new habit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {habitType === "reduce" && (
                <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
                  <Label>Allowed Frequency</Label>
                  <p className="text-sm text-muted-foreground">
                    How often can you indulge without breaking your streak?
                  </p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={allowedFrequency || ""}
                      onChange={(e) => setAllowedFrequency(Number.parseInt(e.target.value) || null)}
                      className="w-20"
                      placeholder="2"
                    />
                    <span className="text-muted-foreground">times per</span>
                    <Select
                      value={frequencyPeriod}
                      onValueChange={(v) => setFrequencyPeriod(v as typeof frequencyPeriod)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">When did you start (or want to start) this habit?</p>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg border transition-colors ${
                        icon === emoji ? "border-primary bg-primary/10" : "hover:border-primary/50"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full transition-transform ${
                        color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading || !name}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Habit"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
}
