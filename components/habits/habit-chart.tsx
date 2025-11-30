"use client"

import { useMemo } from "react"
import type { Checkin } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface HabitChartProps {
  checkins: Checkin[]
  habitColor: string
}

export function HabitChart({ checkins, habitColor }: HabitChartProps) {
  const chartData = useMemo(() => {
    // Get last 30 days
    const data: { date: string; label: string; streak: number }[] = []
    const today = new Date()
    let currentStreak = 0

    // Sort checkins by date ascending
    const sortedCheckins = [...checkins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const checkinMap = new Map<string, Checkin>()
    sortedCheckins.forEach((c) => checkinMap.set(c.date, c))

    // Calculate cumulative streak for each day
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const checkin = checkinMap.get(dateStr)

      if (checkin?.status === "clean" || checkin?.status === "indulged") {
        currentStreak++
      } else if (checkin?.status === "relapse") {
        currentStreak = 0
      }

      data.push({
        date: dateStr,
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        streak: currentStreak,
      })
    }

    return data
  }, [checkins])

  const maxStreak = Math.max(...chartData.map((d) => d.streak), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">30-Day Streak Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={habitColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={habitColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis domain={[0, maxStreak + 2]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border rounded-lg px-3 py-2 shadow-md">
                        <p className="text-xs text-muted-foreground">{payload[0].payload.label}</p>
                        <p className="font-medium">{payload[0].value} day streak</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="streak" stroke={habitColor} strokeWidth={2} fill="url(#streakGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
