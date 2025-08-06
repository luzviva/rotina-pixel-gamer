-- Create ENUM types for task frequency and time mode
CREATE TYPE public.task_frequency AS ENUM ('DIARIA', 'SEMANAL', 'UNICA', 'DATAS_ESPECIFICAS');
CREATE TYPE public.time_mode AS ENUM ('start-end', 'start-duration');

-- Add new columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN frequency public.task_frequency DEFAULT 'DIARIA',
ADD COLUMN date_start DATE,
ADD COLUMN date_end DATE,
ADD COLUMN weekdays TEXT[],
ADD COLUMN specific_dates DATE[],
ADD COLUMN time_start TIME,
ADD COLUMN time_end TIME,
ADD COLUMN time_mode public.time_mode DEFAULT 'start-end',
ADD COLUMN duration_minutes INTEGER;