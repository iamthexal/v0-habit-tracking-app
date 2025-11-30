-- Create achievements table (system-wide, not user-specific)
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak', 'total_days', 'habits_count', 'checkins_count')),
  requirement_value INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow everyone to read achievements (they're public)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_select_all" ON public.achievements 
  FOR SELECT USING (true);

-- Only service role can insert/update/delete achievements
CREATE POLICY "achievements_insert_service" ON public.achievements 
  FOR INSERT WITH CHECK (false);

CREATE POLICY "achievements_update_service" ON public.achievements 
  FOR UPDATE USING (false);

CREATE POLICY "achievements_delete_service" ON public.achievements 
  FOR DELETE USING (false);
