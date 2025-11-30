-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  reminder_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  message TEXT,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('push', 'email', 'in_app')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "reminders_select_own" ON public.reminders 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reminders_insert_own" ON public.reminders 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminders_update_own" ON public.reminders 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reminders_delete_own" ON public.reminders 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS reminders_habit_id_idx ON public.reminders(habit_id);
