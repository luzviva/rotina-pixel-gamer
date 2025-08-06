-- Criar tabela para sugestões de feedback
CREATE TABLE public.feedback_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  suggestion TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.feedback_suggestions ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que qualquer usuário autenticado insira feedback
CREATE POLICY "Authenticated users can create feedback" 
ON public.feedback_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Criar política para que usuários vejam apenas seus próprios feedbacks
CREATE POLICY "Users can view their own feedback" 
ON public.feedback_suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Criar trigger para atualizar o campo updated_at automaticamente
CREATE TRIGGER update_feedback_suggestions_updated_at
  BEFORE UPDATE ON public.feedback_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();