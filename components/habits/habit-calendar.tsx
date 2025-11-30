"use client"

import { useState, useMemo } from "react"
import type { Checkin } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitCalendarProps {
  checkins: Checkin[]
  habitColor: string
}

export function HabitCalendar({ checkins, habitColor }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const checkinMap = useMemo(() => {
    const map = new Map<string, Checkin>()
    checkins.forEach((c) => map.set(c.date, c))
    return map
  }, [checkins])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()

  const days = useMemo(() => {
    const result: (number | null)[] = []

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
      result.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day)
    }

    return result
  }, [startingDay, daysInMonth])

  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const isFuture = (day: number) => {
    const date = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Progress Calendar</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{monthName}</p>
      </CardHeader>
      <CardContent>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const dateStr = getDateString(day)
            const checkin = checkinMap.get(dateStr)
            const future = isFuture(day)
            const today = isToday(day)

            return (
              <div
                key={dateStr}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-sm relative transition-colors",
                  today && "ring-2 ring-primary ring-offset-1",
                  future && "text-muted-foreground/50",
                  !checkin && !future && "bg-muted/30 hover:bg-muted/50",
                )}
                style={
                  checkin
                    ? {
                        backgroundColor:
                          checkin.status === "clean"
                            ? habitColor
                            : checkin.status === "indulged"
                              ? "#fbbf24"
                              : "#ef4444",
                        color: "#fff",
                      }
                    : undefined
                }
              >
                {day}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: habitColor }} />
            <span className="text-xs text-muted-foreground">Clean</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Indulged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span className="text-xs text-muted-foreground">Slip</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
