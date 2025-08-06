-- Add PIN field to profiles table for parent PIN storage
ALTER TABLE public.profiles 
ADD COLUMN parent_pin VARCHAR(4) DEFAULT NULL;

-- Add constraint to ensure PIN is 4 digits
ALTER TABLE public.profiles 
ADD CONSTRAINT check_parent_pin_format 
CHECK (parent_pin IS NULL OR (length(parent_pin) = 4 AND parent_pin ~ '^[0-9]{4}$'));