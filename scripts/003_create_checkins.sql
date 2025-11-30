-- Create check-ins table
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('clean', 'indulged', 'relapse')),
  notes TEXT,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  triggers TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one check-in per habit per day
  UNIQUE(habit_id, date)
);

-- Enable RLS
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "checkins_select_own" ON public.checkins 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "checkins_insert_own" ON public.checkins 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checkins_update_own" ON public.checkins 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "checkins_delete_own" ON public.checkins 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS checkins_habit_id_idx ON public.checkins(habit_id);
CREATE INDEX IF NOT EXISTS checkins_user_id_idx ON public.checkins(user_id);
CREATE INDEX IF NOT EXISTS checkins_date_idx ON public.checkins(date);
