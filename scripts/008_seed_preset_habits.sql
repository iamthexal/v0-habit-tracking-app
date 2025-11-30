-- This creates a reference table for preset habits that users can choose from
-- Note: This is a separate table just for presets, not user habits

CREATE TABLE IF NOT EXISTS public.preset_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('addiction', 'habit')),
  habit_type TEXT NOT NULL CHECK (habit_type IN ('quit', 'reduce', 'build')),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  suggested_frequency INTEGER,
  frequency_period TEXT CHECK (frequency_period IN ('day', 'week', 'month')),
  tips TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow everyone to read presets
ALTER TABLE public.preset_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preset_habits_select_all" ON public.preset_habits 
  FOR SELECT USING (true);

-- Seed preset habits
INSERT INTO public.preset_habits (name, description, category, habit_type, icon, color, suggested_frequency, frequency_period, tips) VALUES
-- Addictions to quit
('Smoking', 'Track your journey to quit smoking cigarettes', 'addiction', 'quit', '🚬', '#ef4444', NULL, NULL, 
  ARRAY['Drink water when cravings hit', 'Take deep breaths', 'Keep your hands busy', 'Avoid triggers like alcohol']),
  
('Vaping', 'Break free from vaping and e-cigarettes', 'addiction', 'quit', '💨', '#f97316', NULL, NULL,
  ARRAY['Gradually reduce nicotine levels', 'Replace with sugar-free gum', 'Exercise to manage stress']),

('Alcohol', 'Track sobriety from alcohol', 'addiction', 'quit', '🍺', '#eab308', NULL, NULL,
  ARRAY['Find alcohol-free alternatives', 'Avoid triggering situations', 'Build a support network']),

('Cannabis', 'Track your cannabis-free journey', 'addiction', 'quit', '🌿', '#22c55e', NULL, NULL,
  ARRAY['Stay active and exercise', 'Get enough sleep', 'Find new hobbies']),

('Caffeine', 'Reduce or quit caffeine dependency', 'addiction', 'reduce', '☕', '#78350f', 1, 'day',
  ARRAY['Gradually reduce intake', 'Switch to decaf', 'Stay hydrated']),

('Sugar', 'Cut down on sugar consumption', 'addiction', 'reduce', '🍬', '#ec4899', 2, 'week',
  ARRAY['Read nutrition labels', 'Find healthy alternatives', 'Eat regular meals']),

('Soda', 'Reduce soda and sugary drink consumption', 'addiction', 'reduce', '🥤', '#06b6d4', 2, 'week',
  ARRAY['Try sparkling water', 'Add fruit to water', 'Keep water bottle handy']),

('Fast Food', 'Cut back on fast food consumption', 'addiction', 'reduce', '🍔', '#f59e0b', 1, 'week',
  ARRAY['Meal prep on weekends', 'Keep healthy snacks ready', 'Cook simple meals at home']),

('Social Media', 'Reduce time spent on social media', 'addiction', 'reduce', '📱', '#3b82f6', 30, 'day',
  ARRAY['Set app time limits', 'Turn off notifications', 'Find offline hobbies']),

('Gaming', 'Manage gaming time better', 'addiction', 'reduce', '🎮', '#8b5cf6', 2, 'day',
  ARRAY['Set gaming schedules', 'Take regular breaks', 'Balance with other activities']),

('Gambling', 'Track gambling-free days', 'addiction', 'quit', '🎰', '#dc2626', NULL, NULL,
  ARRAY['Self-exclude from gambling sites', 'Seek professional help', 'Find support groups']),

('Porn', 'Break free from pornography', 'addiction', 'quit', '🔒', '#64748b', NULL, NULL,
  ARRAY['Install website blockers', 'Find healthier outlets', 'Seek support if needed']),

('Nail Biting', 'Stop the nail biting habit', 'addiction', 'quit', '💅', '#f472b6', NULL, NULL,
  ARRAY['Keep nails trimmed', 'Use bitter nail polish', 'Find stress alternatives']),

('Procrastination', 'Beat procrastination habits', 'addiction', 'reduce', '⏰', '#6366f1', NULL, NULL,
  ARRAY['Break tasks into small steps', 'Use the 2-minute rule', 'Remove distractions']),

-- Positive habits to build
('Exercise', 'Build a regular exercise routine', 'habit', 'build', '🏃', '#10b981', 4, 'week',
  ARRAY['Start small', 'Schedule workout times', 'Find activities you enjoy']),

('Meditation', 'Develop a meditation practice', 'habit', 'build', '🧘', '#14b8a6', 1, 'day',
  ARRAY['Start with 5 minutes', 'Use guided apps', 'Same time each day']),

('Reading', 'Build a reading habit', 'habit', 'build', '📖', '#0ea5e9', 1, 'day',
  ARRAY['Set a page goal', 'Read before bed', 'Always carry a book']),

('Water Intake', 'Drink enough water daily', 'habit', 'build', '💧', '#0284c7', 8, 'day',
  ARRAY['Use a marked water bottle', 'Set reminders', 'Drink before meals']),

('Sleep Schedule', 'Maintain consistent sleep times', 'habit', 'build', '😴', '#6366f1', 1, 'day',
  ARRAY['Set a bedtime alarm', 'Avoid screens before bed', 'Create a sleep routine']),

('Journaling', 'Write daily journal entries', 'habit', 'build', '📓', '#a855f7', 1, 'day',
  ARRAY['Write at the same time', 'Start with prompts', 'Keep it simple']),

('Gratitude', 'Practice daily gratitude', 'habit', 'build', '🙏', '#f59e0b', 1, 'day',
  ARRAY['Write 3 things daily', 'Be specific', 'Include small things']),

('Healthy Eating', 'Eat more fruits and vegetables', 'habit', 'build', '🥗', '#22c55e', 5, 'day',
  ARRAY['Prep vegetables in advance', 'Add veggies to every meal', 'Try new recipes'])

ON CONFLICT DO NOTHING;
