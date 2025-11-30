"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Habit, Checkin, UserAchievement } from "@/lib/types"
import { calculateHabitStats, formatStreak, getStreakMessage } from "@/lib/utils/habit-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  ArrowLeft,
  Flame,
  TrendingUp,
  Calendar,
  Trophy,
  MoreVertical,
  Pause,
  Play,
  Archive,
  Trash2,
  Check,
  AlertCircle,
  X,
  Loader2,
  BarChart3,
  CalendarDays,
} from "lucide-react"
import Link from "next/link"
import { HabitCalendar } from "./habit-calendar"
import { HabitChart } from "./habit-chart"
import { HabitHeatmap } from "./habit-heatmap"

interface HabitDetailProps {
  habit: Habit
  checkins: Checkin[]
  achievements: UserAchievement[]
}

export function HabitDetail({ habit, checkins, achievements }: HabitDetailProps) {
  const router = useRouter()
  const stats = calculateHabitStats(habit, checkins)
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [checkinStatus, setCheckinStatus] = useState<"clean" | "indulged" | "relapse">("clean")
  const [checkinNotes, setCheckinNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const todayCheckin = checkins.find((c) => c.date === today)

  const handleCheckin = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      if (todayCheckin) {
        const { error } = await supabase
          .from("checkins")
          .update({ status: checkinStatus, notes: checkinNotes || null })
          .eq("id", todayCheckin.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("checkins").insert({
          habit_id: habit.id,
          user_id: user.id,
          date: today,
          status: checkinStatus,
          notes: checkinNotes || null,
        })

        if (error) throw error
      }

      toast.success(
        checkinStatus === "clean"
          ? "Amazing! Keep up the great work!"
          : checkinStatus === "indulged"
            ? "Logged. Remember, progress isn't always linear."
            : "Logged. Tomorrow is a fresh start!",
      )

      setCheckinDialogOpen(false)
      setCheckinNotes("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to check in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async () => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("habits").update({ is_active: !habit.is_active }).eq("id", habit.id)

      if (error) throw error

      toast.success(habit.is_active ? "Habit paused" : "Habit resumed")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update habit")
    }
  }

  const handleArchive = async () => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("habits").update({ is_archived: true, is_active: false }).eq("id", habit.id)

      if (error) throw error

      toast.success("Habit archived")
      router.push("/dashboard/habits")
      router.refresh()
    } catch (error) {
      toast.error("Failed to archive habit")
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("habits").delete().eq("id", habit.id)

      if (error) throw error

      toast.success("Habit deleted")
      router.push("/dashboard/habits")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete habit")
    } finally {
      setIsLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/habits">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${habit.color}20` }}
            >
              {habit.icon}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{habit.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {habit.habit_type} {habit.category}
                </Badge>
                {habit.allowed_frequency && (
                  <Badge variant="secondary">
                    {habit.allowed_frequency}/{habit.frequency_period} allowed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleActive}>
              {habit.is_active ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause habit
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Resume habit
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" /> Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Streak Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Flame className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold">{formatStreak(stats.currentStreak)}</p>
                <p className="text-sm text-primary font-medium">{getStreakMessage(stats.currentStreak)}</p>
              </div>
            </div>
            <Button size="lg" onClick={() => setCheckinDialogOpen(true)} disabled={!habit.is_active}>
              {todayCheckin ? "Update Today's Check-in" : "Check In for Today"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatStreak(stats.longestStreak)}</p>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <Calendar className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCleanDays}</p>
                <p className="text-xs text-muted-foreground">Total Clean Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <Trophy className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-4/10">
                <AlertCircle className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {habit.allowed_frequency
                    ? `${stats.indulgencesThisPeriod}/${habit.allowed_frequency}`
                    : stats.totalIndulgences}
                </p>
                <p className="text-xs text-muted-foreground">
                  {habit.allowed_frequency ? `This ${habit.frequency_period}` : "Total Indulgences"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="chart" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Calendar className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <HabitCalendar checkins={checkins} habitColor={habit.color} />
            <HabitHeatmap checkins={checkins} habitColor={habit.color} />
          </div>
        </TabsContent>

        <TabsContent value="chart">
          <HabitChart checkins={checkins} habitColor={habit.color} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Check-in History</CardTitle>
            </CardHeader>
            <CardContent>
              {checkins.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No check-ins yet. Start tracking today!</p>
              ) : (
                <div className="space-y-2">
                  {checkins.slice(0, 30).map((checkin) => {
                    const date = new Date(checkin.date)
                    const isToday = checkin.date === today

                    return (
                      <div key={checkin.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              checkin.status === "clean"
                                ? "bg-green-500/10 text-green-600"
                                : checkin.status === "indulged"
                                  ? "bg-yellow-500/10 text-yellow-600"
                                  : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {checkin.status === "clean" ? (
                              <Check className="h-4 w-4" />
                            ) : checkin.status === "indulged" ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {isToday
                                ? "Today"
                                : date.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                            </p>
                            {checkin.notes && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{checkin.notes}</p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            checkin.status === "clean"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : checkin.status === "indulged"
                                ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                          }
                        >
                          {checkin.status === "clean" ? "Clean" : checkin.status === "indulged" ? "Indulged" : "Slip"}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Achievements for this habit */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievements Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {achievements.map((ua) => (
                <div key={ua.id} className="flex flex-col items-center p-4 rounded-lg bg-muted/30 text-center">
                  <span className="text-3xl mb-2">{ua.achievement?.icon}</span>
                  <p className="font-medium text-sm">{ua.achievement?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{ua.achievement?.tier}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in Dialog */}
      <Dialog open={checkinDialogOpen} onOpenChange={setCheckinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daily Check-in</DialogTitle>
            <DialogDescription>How did you do with {habit.name} today?</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setCheckinStatus("clean")}
                className={`p-4 rounded-lg border text-center transition-all ${
                  checkinStatus === "clean" ? "border-green-500 bg-green-500/10" : "hover:border-green-500/50"
                }`}
              >
                <Check className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="font-medium text-sm">Clean</p>
              </button>

              {habit.habit_type !== "quit" && (
                <button
                  onClick={() => setCheckinStatus("indulged")}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    checkinStatus === "indulged" ? "border-yellow-500 bg-yellow-500/10" : "hover:border-yellow-500/50"
                  }`}
                >
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <p className="font-medium text-sm">Indulged</p>
                </button>
              )}

              <button
                onClick={() => setCheckinStatus("relapse")}
                className={`p-4 rounded-lg border text-center transition-all ${
                  checkinStatus === "relapse" ? "border-red-500 bg-red-500/10" : "hover:border-red-500/50"
                }`}
              >
                <X className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <p className="font-medium text-sm">Slip</p>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="How are you feeling? Any triggers or thoughts?"
                value={checkinNotes}
                onChange={(e) => setCheckinNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckinDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Check-in"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{habit.name}"? This will remove all check-in history and cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Habit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
