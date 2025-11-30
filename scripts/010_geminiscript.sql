-- Change start_date column to support time
ALTER TABLE public.habits 
ALTER COLUMN start_date TYPE TIMESTAMPTZ 
USING start_date::TIMESTAMPTZ;

-- If there are any existing rows with null start_date, set them to now (though it was NOT NULL before)
-- This is just a safeguard
UPDATE public.habits 
SET start_date = NOW() 
WHERE start_date IS NULL;
