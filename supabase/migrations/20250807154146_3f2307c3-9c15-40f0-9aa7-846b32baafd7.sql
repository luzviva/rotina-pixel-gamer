-- Add RLS policies for initial_tasks table
-- Enable RLS on initial_tasks
ALTER TABLE initial_tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read initial tasks (they're template tasks)
CREATE POLICY "Authenticated users can view initial tasks" 
ON initial_tasks 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only allow admins/system to insert initial tasks (for now we'll allow authenticated users with proper role check later)
CREATE POLICY "System can manage initial tasks" 
ON initial_tasks 
FOR ALL 
USING (auth.uid() IS NOT NULL);