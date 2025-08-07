-- Add is_visible column to store_items table
ALTER TABLE public.store_items 
ADD COLUMN is_visible boolean NOT NULL DEFAULT true;

-- Add an index for better performance on visibility queries
CREATE INDEX idx_store_items_is_visible ON public.store_items(is_visible);