-- Fix data types in initial_tasks table to match get_initial_tasks function
-- First, backup any existing data and convert types carefully

-- Step 1: Convert id from text to uuid (generate new UUIDs for existing records)
ALTER TABLE initial_tasks ALTER COLUMN id TYPE uuid USING gen_random_uuid();

-- Step 2: Convert points from bigint to integer
ALTER TABLE initial_tasks ALTER COLUMN points TYPE integer USING points::integer;

-- Step 3: Convert frequency from text to task_frequency enum
ALTER TABLE initial_tasks ALTER COLUMN frequency TYPE task_frequency USING 
  CASE 
    WHEN frequency = 'DIARIA' THEN 'DIARIA'::task_frequency
    WHEN frequency = 'SEMANAL' THEN 'SEMANAL'::task_frequency
    WHEN frequency = 'UNICA' THEN 'UNICA'::task_frequency
    WHEN frequency = 'DATAS_ESPECIFICAS' THEN 'DATAS_ESPECIFICAS'::task_frequency
    ELSE 'DIARIA'::task_frequency
  END;

-- Step 4: Convert weekdays from jsonb to integer array
ALTER TABLE initial_tasks ALTER COLUMN weekdays TYPE integer[] USING 
  CASE 
    WHEN weekdays IS NULL THEN NULL
    WHEN jsonb_typeof(weekdays) = 'array' THEN 
      ARRAY(SELECT jsonb_array_elements_text(weekdays)::integer)
    ELSE NULL
  END;

-- Step 5: Convert time_start from text to time without time zone
ALTER TABLE initial_tasks ALTER COLUMN time_start TYPE time without time zone USING 
  CASE 
    WHEN time_start IS NULL OR time_start = '' THEN NULL
    ELSE time_start::time without time zone
  END;

-- Step 6: Convert time_end from text to time without time zone
ALTER TABLE initial_tasks ALTER COLUMN time_end TYPE time without time zone USING 
  CASE 
    WHEN time_end IS NULL OR time_end = '' THEN NULL
    ELSE time_end::time without time zone
  END;

-- Step 7: Convert time_mode from text to time_mode enum
ALTER TABLE initial_tasks ALTER COLUMN time_mode TYPE time_mode USING 
  CASE 
    WHEN time_mode = 'start-end' THEN 'start-end'::time_mode
    WHEN time_mode = 'duration' THEN 'duration'::time_mode
    ELSE 'start-end'::time_mode
  END;

-- Step 8: Convert duration_minutes from text to integer
ALTER TABLE initial_tasks ALTER COLUMN duration_minutes TYPE integer USING 
  CASE 
    WHEN duration_minutes IS NULL OR duration_minutes = '' THEN NULL
    ELSE duration_minutes::integer
  END;

-- Step 9: Set proper defaults and constraints
ALTER TABLE initial_tasks ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE initial_tasks ALTER COLUMN points SET DEFAULT 10;
ALTER TABLE initial_tasks ALTER COLUMN frequency SET DEFAULT 'DIARIA'::task_frequency;
ALTER TABLE initial_tasks ALTER COLUMN time_mode SET DEFAULT 'start-end'::time_mode;
ALTER TABLE initial_tasks ALTER COLUMN is_visible SET DEFAULT true;