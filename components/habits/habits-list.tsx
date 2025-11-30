"use client"

import { useState } from "react"
import Link from "next/link"
import type { Habit, Checkin } from "@/lib/types"
import { calculateHabitStats, formatStreak } from "@/lib/utils/habit-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, ChevronRight, Plus, Archive } from "lucide-react"

interface HabitsListProps {
  habitsWithCheckins: { habit: Habit; checkins: Checkin[] }[]
}

export function HabitsList({ habitsWithCheckins }: HabitsListProps) {
  const [filter, setFilter] = useState<"active" | "archived" | "all">("active")

  const filteredHabits = habitsWithCheckins.filter(({ habit }) => {
    if (filter === "active") return habit.is_active && !habit.is_archived
    if (filter === "archived") return habit.is_archived
    return true
  })

  if (habitsWithCheckins.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Plus className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You haven't added any habits yet. Choose from our pre-built templates or create a custom habit to start
            tracking your progress.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/habits/new">Add Your First Habit</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredHabits.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No {filter === "all" ? "" : filter} habits found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHabits.map(({ habit, checkins }) => {
            const stats = calculateHabitStats(habit, checkins)

            return (
              <Link key={habit.id} href={`/dashboard/habits/${habit.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${habit.color}20` }}
                      >
                        {habit.icon}
                      </div>
                      <Badge variant={habit.is_active ? "default" : "secondary"} className="text-xs">
                        {habit.is_archived ? "Archived" : habit.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {habit.name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize mb-4">
                      {habit.habit_type} {habit.category}
                      {habit.allowed_frequency && (
                        <span>
                          {" "}
                          • {habit.allowed_frequency}/{habit.frequency_period}
                        </span>
                      )}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-chart-3" />
                        <span className="font-medium">{formatStreak(stats.currentStreak)}</span>
                        <span className="text-sm text-muted-foreground">streak</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
