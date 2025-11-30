-- Seed achievements data
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value, tier, category) VALUES
-- Streak achievements
('First Step', 'Complete your first day clean', '🌱', 'streak', 1, 'bronze', 'streak'),
('One Week Strong', 'Maintain a 7-day streak', '🔥', 'streak', 7, 'bronze', 'streak'),
('Two Week Warrior', 'Maintain a 14-day streak', '⚡', 'streak', 14, 'silver', 'streak'),
('Monthly Master', 'Maintain a 30-day streak', '🏆', 'streak', 30, 'silver', 'streak'),
('Quarter Champion', 'Maintain a 90-day streak', '👑', 'streak', 90, 'gold', 'streak'),
('Half Year Hero', 'Maintain a 180-day streak', '💎', 'streak', 180, 'gold', 'streak'),
('Year of Freedom', 'Maintain a 365-day streak', '🌟', 'streak', 365, 'platinum', 'streak'),
('Legendary', 'Maintain a 500-day streak', '🏅', 'streak', 500, 'diamond', 'streak'),

-- Total days achievements
('Getting Started', 'Log 10 total clean days', '📊', 'total_days', 10, 'bronze', 'progress'),
('Building Momentum', 'Log 50 total clean days', '📈', 'total_days', 50, 'silver', 'progress'),
('Century Club', 'Log 100 total clean days', '💯', 'total_days', 100, 'gold', 'progress'),
('Dedicated', 'Log 250 total clean days', '🎯', 'total_days', 250, 'platinum', 'progress'),
('Life Changer', 'Log 500 total clean days', '✨', 'total_days', 500, 'diamond', 'progress'),

-- Habits count achievements
('Multi-Tasker', 'Track 3 habits simultaneously', '🎪', 'habits_count', 3, 'bronze', 'habits'),
('Habit Collector', 'Track 5 habits simultaneously', '📚', 'habits_count', 5, 'silver', 'habits'),
('Lifestyle Designer', 'Track 10 habits simultaneously', '🎨', 'habits_count', 10, 'gold', 'habits'),

-- Check-ins count achievements
('Consistent', 'Complete 50 check-ins', '✅', 'checkins_count', 50, 'bronze', 'engagement'),
('Reliable', 'Complete 200 check-ins', '📝', 'checkins_count', 200, 'silver', 'engagement'),
('Dedicated Tracker', 'Complete 500 check-ins', '🗓️', 'checkins_count', 500, 'gold', 'engagement'),
('Tracking Master', 'Complete 1000 check-ins', '🏛️', 'checkins_count', 1000, 'platinum', 'engagement')

ON CONFLICT DO NOTHING;
