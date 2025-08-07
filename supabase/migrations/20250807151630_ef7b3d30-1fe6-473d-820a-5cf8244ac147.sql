-- Create RPC function to fetch initial tasks
CREATE OR REPLACE FUNCTION public.get_initial_tasks()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  points integer,
  frequency task_frequency,
  weekdays integer[],
  time_start time without time zone,
  time_end time without time zone,
  time_mode time_mode,
  duration_minutes integer,
  is_visible boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    initial_tasks.id,
    initial_tasks.title,
    initial_tasks.description,
    initial_tasks.points,
    initial_tasks.frequency,
    initial_tasks.weekdays,
    initial_tasks.time_start,
    initial_tasks.time_end,
    initial_tasks.time_mode,
    initial_tasks.duration_minutes,
    initial_tasks.is_visible
  FROM initial_tasks
  ORDER BY initial_tasks.created_at;
END;
$$;