-- Add visibility field to tasks table
ALTER TABLE public.tasks 
ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;