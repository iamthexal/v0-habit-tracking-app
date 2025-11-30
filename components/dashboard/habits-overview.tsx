"use client"

import Link from "next/link"
import type { Habit } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Plus } from "lucide-react"

interface HabitsOverviewProps {
  habits: Habit[]
}

export function HabitsOverview({ habits }: HabitsOverviewProps) {
  const activeHabits = habits.filter((h) => h.is_active).slice(0, 5)

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">Start your journey by adding your first habit to track.</p>
          <Button asChild>
            <Link href="/dashboard/habits/new">Add Your First Habit</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Your Habits</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/habits" className="gap-1">
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeHabits.map((habit) => (
            <Link
              key={habit.id}
              href={`/dashboard/habits/${habit.id}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${habit.color}20` }}
                >
                  {habit.icon}
                </div>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">{habit.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {habit.habit_type} {habit.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={habit.is_active ? "default" : "secondary"} className="hidden sm:flex">
                  {habit.is_active ? "Active" : "Paused"}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
