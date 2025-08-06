-- Corrigir política de visualização dos itens da loja
-- Remover a política atual que permite todos verem
DROP POLICY IF EXISTS "Everyone can view store items" ON public.store_items;

-- Criar nova política para que apenas quem criou possa ver
CREATE POLICY "Users can view their own store items" 
ON public.store_items 
FOR SELECT 
USING (auth.uid() = created_by);

-- Corrigir política de visualização das missões especiais
-- Remover a política atual que permite todos verem
DROP POLICY IF EXISTS "Everyone can view active special missions" ON public.special_missions;

-- Criar nova política para que apenas quem criou possa ver
CREATE POLICY "Users can view their own special missions" 
ON public.special_missions 
FOR SELECT 
USING (auth.uid() = created_by);