-- Add foreign key relationship between tasks.created_by and profiles.user_id
ALTER TABLE public.tasks 
ADD CONSTRAINT fk_tasks_created_by_profiles 
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id);