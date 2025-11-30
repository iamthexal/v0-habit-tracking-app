"use client"

import { useMemo } from "react"
import type { Checkin } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface HabitHeatmapProps {
  checkins: Checkin[]
  habitColor: string
}

export function HabitHeatmap({ checkins, habitColor }: HabitHeatmapProps) {
  const heatmapData = useMemo(() => {
    const data: {
      date: string
      checkin: Checkin | null
      dayOfWeek: number
      weekIndex: number
    }[] = []

    const today = new Date()
    const checkinMap = new Map<string, Checkin>()
    checkins.forEach((c) => checkinMap.set(c.date, c))

    // Get last 12 weeks (84 days)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 83)

    // Align to Sunday
    const dayOffset = startDate.getDay()
    startDate.setDate(startDate.getDate() - dayOffset)

    for (let i = 0; i < 84 + dayOffset; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      data.push({
        date: dateStr,
        checkin: checkinMap.get(dateStr) || null,
        dayOfWeek: date.getDay(),
        weekIndex: Math.floor(i / 7),
      })
    }

    return data
  }, [checkins])

  // Group by weeks
  const weeks = useMemo(() => {
    const result: (typeof heatmapData)[] = []
    let currentWeek: typeof heatmapData = []

    heatmapData.forEach((day, index) => {
      currentWeek.push(day)
      if ((index + 1) % 7 === 0) {
        result.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }

    return result
  }, [heatmapData])

  const getCellColor = (checkin: Checkin | null, isToday: boolean) => {
    if (!checkin) return "bg-muted/30"
    if (checkin.status === "clean") return ""
    if (checkin.status === "indulged") return "bg-yellow-500"
    return "bg-red-500"
  }

  const today = new Date().toISOString().split("T")[0]
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Activity Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">Last 12 weeks</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {weekDays.map((day, i) => (
              <div key={i} className="h-3 w-3 text-[10px] text-muted-foreground flex items-center justify-center">
                {i % 2 === 1 ? day : ""}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1 overflow-x-auto">
            <TooltipProvider delayDuration={100}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const isToday = day.date === today
                    const isFuture = new Date(day.date) > new Date()

                    return (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "h-3 w-3 rounded-sm transition-colors",
                              isFuture && "opacity-30",
                              isToday && "ring-1 ring-primary",
                              getCellColor(day.checkin, isToday),
                            )}
                            style={day.checkin?.status === "clean" ? { backgroundColor: habitColor } : undefined}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-muted-foreground">
                            {day.checkin
                              ? day.checkin.status === "clean"
                                ? "Clean day"
                                : day.checkin.status === "indulged"
                                  ? "Indulged"
                                  : "Slip"
                              : isFuture
                                ? "Future"
                                : "No check-in"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </TooltipProvider>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs">
          <span className="text-muted-foreground">Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-muted/30" />
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: habitColor, opacity: 0.3 }} />
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: habitColor, opacity: 0.6 }} />
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: habitColor }} />
          </div>
          <span className="text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  )
}
