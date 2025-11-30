-- Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('addiction', 'habit')),
  habit_type TEXT NOT NULL CHECK (habit_type IN ('quit', 'reduce', 'build')),
  icon TEXT NOT NULL DEFAULT '🎯',
  color TEXT NOT NULL DEFAULT '#10b981',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- For 'reduce' type: allowed frequency per period
  allowed_frequency INTEGER,
  frequency_period TEXT CHECK (frequency_period IN ('day', 'week', 'month')),
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "habits_select_own" ON public.habits 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "habits_insert_own" ON public.habits 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits_update_own" ON public.habits 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "habits_delete_own" ON public.habits 
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS habits_is_active_idx ON public.habits(is_active);
