"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth/auth-modal"
import { Flame, Target, Trophy, Bell, TrendingUp, Shield, ChevronRight, Sparkles } from "lucide-react"

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<"login" | "signup">("login")

  const openAuth = (tab: "login" | "signup") => {
    setAuthTab(tab)
    setAuthOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">HabitFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => openAuth("login")}>
              Log In
            </Button>
            <Button onClick={() => openAuth("signup")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Your journey to better habits starts here
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              Break Free from Bad Habits. <span className="text-primary">Build Better Ones.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Track your progress, celebrate milestones, and stay motivated with a supportive habit tracker designed to
              help you succeed—without judgment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => openAuth("signup")} className="gap-2">
                Start Your Journey
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => openAuth("login")}>
                Welcome Back
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed with compassion to support your habit-building journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Tracking</h3>
              <p className="text-muted-foreground">
                Track habits to quit, reduce, or build. Set allowed indulgences without breaking your streak.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Flame className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Streak Counter</h3>
              <p className="text-muted-foreground">
                Watch your streaks grow day by day. Visual progress that keeps you motivated.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-chart-2/20 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Achievements</h3>
              <p className="text-muted-foreground">
                Earn badges as you hit milestones. From bronze to diamond, celebrate every win.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-chart-4/20 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-chart-4" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Reminders</h3>
              <p className="text-muted-foreground">
                Get gentle nudges via push notifications, email, or in-app alerts to stay on track.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-chart-1/20 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-chart-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Analytics</h3>
              <p className="text-muted-foreground">
                Beautiful charts and calendar views to visualize your journey over time.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-chart-5/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-chart-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Judgment Zone</h3>
              <p className="text-muted-foreground">
                Slip-ups happen. Log them, learn from them, and keep moving forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-built Habits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start with Pre-Built Templates</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from our library of common habits and addictions, or create your own custom trackers.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              { icon: "🚬", name: "Smoking" },
              { icon: "🍺", name: "Alcohol" },
              { icon: "🥤", name: "Soda" },
              { icon: "☕", name: "Caffeine" },
              { icon: "📱", name: "Social Media" },
              { icon: "🍬", name: "Sugar" },
              { icon: "🎮", name: "Gaming" },
              { icon: "🏃", name: "Exercise" },
              { icon: "🧘", name: "Meditation" },
              { icon: "📖", name: "Reading" },
              { icon: "💧", name: "Water Intake" },
              { icon: "😴", name: "Sleep" },
            ].map((habit) => (
              <div
                key={habit.name}
                className="inline-flex items-center gap-2 bg-card border rounded-full px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <span>{habit.icon}</span>
                {habit.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Habits?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of people who are building better lives, one day at a time.
          </p>
          <Button size="lg" variant="secondary" onClick={() => openAuth("signup")} className="gap-2">
            Get Started Free
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">HabitFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">Built with care to help you succeed.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    </div>
  )
}
