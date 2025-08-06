-- Drop existing tables to restructure
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.special_missions CASCADE;
DROP TABLE IF EXISTS public.store_items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Create profiles table (only for authenticated parents)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  user_type TEXT CHECK (user_type IN ('parent')) NOT NULL DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create children table (child profiles created by parents)
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender TEXT,
  birth_date DATE,
  avatar_url TEXT,
  coin_balance INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table (associated with specific children)
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL DEFAULT 'easy',
  category TEXT NOT NULL DEFAULT 'general',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store items table
CREATE TABLE public.store_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  store_item_id UUID NOT NULL REFERENCES public.store_items(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create special missions table
CREATE TABLE public.special_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_missions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for children
CREATE POLICY "Parents can view their own children" 
ON public.children 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create children" 
ON public.children 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their children" 
ON public.children 
FOR UPDATE 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their children" 
ON public.children 
FOR DELETE 
USING (auth.uid() = parent_id);

-- Create policies for tasks
CREATE POLICY "Parents can view tasks of their children" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = tasks.child_id 
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can create tasks for their children" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = tasks.child_id 
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can update tasks of their children" 
ON public.tasks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = tasks.child_id 
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can delete tasks of their children" 
ON public.tasks 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = tasks.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- Create policies for store items
CREATE POLICY "Everyone can view store items" 
ON public.store_items 
FOR SELECT 
USING (true);

CREATE POLICY "Parents can create store items" 
ON public.store_items 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Parents can update their store items" 
ON public.store_items 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Parents can delete their store items" 
ON public.store_items 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create policies for purchases
CREATE POLICY "Parents can view purchases of their children" 
ON public.purchases 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = purchases.child_id 
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can create purchases for their children" 
ON public.purchases 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = purchases.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- Create policies for special missions
CREATE POLICY "Everyone can view active special missions" 
ON public.special_missions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Parents can create special missions" 
ON public.special_missions 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Parents can update their special missions" 
ON public.special_missions 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_items_updated_at
  BEFORE UPDATE ON public.store_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_missions_updated_at
  BEFORE UPDATE ON public.special_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration (creates parent profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, user_type)
  VALUES (NEW.id, NEW.email, 'parent');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();