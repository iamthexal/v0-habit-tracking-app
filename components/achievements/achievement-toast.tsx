"use client"

import { useEffect, useState } from "react"
import type { Achievement } from "@/lib/types"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

interface AchievementToastProps {
  achievement: Achievement
  onClose: () => void
}

const tierColors = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-cyan-300 to-cyan-500",
  diamond: "from-blue-400 to-purple-500",
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)

    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#fbbf24", "#3b82f6", "#8b5cf6"],
    })

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "bg-card border-2 rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center transform transition-transform duration-500 pointer-events-auto",
          isVisible ? "scale-100" : "scale-75",
        )}
        onClick={onClose}
      >
        <div className="mb-4">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Achievement Unlocked!</p>
          <div
            className={cn(
              "h-20 w-20 rounded-full mx-auto flex items-center justify-center text-4xl bg-gradient-to-br animate-pulse",
              tierColors[achievement.tier as keyof typeof tierColors],
            )}
          >
            {achievement.icon}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-1">{achievement.name}</h3>
        <p className="text-muted-foreground text-sm mb-3">{achievement.description}</p>
        <p className="text-xs text-muted-foreground capitalize">{achievement.tier} tier achievement</p>
      </div>
    </div>
  )
}
