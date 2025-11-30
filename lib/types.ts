export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  timezone: string
  notification_email: boolean
  notification_push: boolean
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  category: "addiction" | "habit"
  habit_type: "quit" | "reduce" | "build"
  icon: string
  color: string
  start_date: string
  allowed_frequency: number | null
  frequency_period: "day" | "week" | "month" | null
  is_active: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Checkin {
  id: string
  habit_id: string
  user_id: string
  date: string
  status: "clean" | "indulged" | "relapse"
  notes: string | null
  mood: number | null
  triggers: string[] | null
  created_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement_type: "streak" | "total_days" | "habits_count" | "checkins_count"
  requirement_value: number
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
  category: string
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  habit_id: string | null
  unlocked_at: string
  achievement?: Achievement
}

export interface Reminder {
  id: string
  user_id: string
  habit_id: string | null
  reminder_time: string
  days_of_week: number[]
  message: string | null
  reminder_type: "push" | "email" | "in_app"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PresetHabit {
  id: string
  name: string
  description: string | null
  category: "addiction" | "habit"
  habit_type: "quit" | "reduce" | "build"
  icon: string
  color: string
  suggested_frequency: number | null
  frequency_period: "day" | "week" | "month" | null
  tips: string[] | null
  created_at: string
}

export interface HabitWithStats extends Habit {
  current_streak: number
  longest_streak: number
  total_clean_days: number
  indulgences_this_period: number
  last_checkin: Checkin | null
}
