"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle, X } from "lucide-react"

interface CheckinWithHabit {
  id: string
  date: string
  status: "clean" | "indulged" | "relapse"
  notes: string | null
  habits: {
    name: string
    icon: string
    color: string
  } | null
}

interface RecentActivityProps {
  checkins: CheckinWithHabit[]
}

export function RecentActivity({ checkins }: RecentActivityProps) {
  if (checkins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity yet. Start by checking in on your habits!
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "clean":
        return {
          icon: Check,
          label: "Clean",
          variant: "default" as const,
          className: "bg-green-500/10 text-green-600 border-green-500/20",
        }
      case "indulged":
        return {
          icon: AlertCircle,
          label: "Indulged",
          variant: "secondary" as const,
          className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        }
      case "relapse":
        return {
          icon: X,
          label: "Slip",
          variant: "destructive" as const,
          className: "bg-red-500/10 text-red-600 border-red-500/20",
        }
      default:
        return {
          icon: Check,
          label: status,
          variant: "secondary" as const,
          className: "",
        }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checkins.map((checkin) => {
            const statusConfig = getStatusConfig(checkin.status)
            const StatusIcon = statusConfig.icon

            return (
              <div key={checkin.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{checkin.habits?.icon || "📝"}</span>
                  <div>
                    <p className="font-medium text-sm">{checkin.habits?.name || "Unknown Habit"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(checkin.date)}</p>
                  </div>
                </div>
                <Badge variant="outline" className={statusConfig.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
