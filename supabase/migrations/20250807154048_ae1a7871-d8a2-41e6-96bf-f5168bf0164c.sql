-- Fix data types in initial_tasks table to match get_initial_tasks function
-- Step by step conversion to avoid subquery issues

-- Step 1: Convert simple types first
ALTER TABLE initial_tasks ALTER COLUMN id TYPE uuid USING gen_random_uuid();
ALTER TABLE initial_tasks ALTER COLUMN points TYPE integer USING COALESCE(points::integer, 10);
ALTER TABLE initial_tasks ALTER COLUMN duration_minutes TYPE integer USING 
  CASE 
    WHEN duration_minutes IS NULL OR duration_minutes = '' THEN NULL
    ELSE duration_minutes::integer
  END;

-- Step 2: Convert frequency to enum
ALTER TABLE initial_tasks ALTER COLUMN frequency TYPE task_frequency USING 
  CASE 
    WHEN frequency = 'DIARIA' THEN 'DIARIA'::task_frequency
    WHEN frequency = 'SEMANAL' THEN 'SEMANAL'::task_frequency
    WHEN frequency = 'UNICA' THEN 'UNICA'::task_frequency
    WHEN frequency = 'DATAS_ESPECIFICAS' THEN 'DATAS_ESPECIFICAS'::task_frequency
    ELSE 'DIARIA'::task_frequency
  END;

-- Step 3: Convert time_mode to enum
ALTER TABLE initial_tasks ALTER COLUMN time_mode TYPE time_mode USING 
  CASE 
    WHEN time_mode = 'start-end' THEN 'start-end'::time_mode
    WHEN time_mode = 'duration' THEN 'duration'::time_mode
    ELSE 'start-end'::time_mode
  END;

-- Step 4: Convert time fields
ALTER TABLE initial_tasks ALTER COLUMN time_start TYPE time without time zone USING 
  CASE 
    WHEN time_start IS NULL OR time_start = '' THEN NULL
    ELSE time_start::time without time zone
  END;

ALTER TABLE initial_tasks ALTER COLUMN time_end TYPE time without time zone USING 
  CASE 
    WHEN time_end IS NULL OR time_end = '' THEN NULL
    ELSE time_end::time without time zone
  END;

-- Step 5: Add a new column for weekdays as integer array and drop the old jsonb one
ALTER TABLE initial_tasks ADD COLUMN weekdays_new integer[];
ALTER TABLE initial_tasks DROP COLUMN weekdays;
ALTER TABLE initial_tasks RENAME COLUMN weekdays_new TO weekdays;

-- Step 6: Set proper defaults
ALTER TABLE initial_tasks ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE initial_tasks ALTER COLUMN points SET DEFAULT 10;
ALTER TABLE initial_tasks ALTER COLUMN frequency SET DEFAULT 'DIARIA'::task_frequency;
ALTER TABLE initial_tasks ALTER COLUMN time_mode SET DEFAULT 'start-end'::time_mode;
ALTER TABLE initial_tasks ALTER COLUMN is_visible SET DEFAULT true;