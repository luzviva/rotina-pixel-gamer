import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Child {
  id: string;
  parent_id: string;
  name: string;
  gender?: string;
  birth_date?: string;
  avatar_url?: string;
  coin_balance: number;
  level: number;
  experience_points: number;
  created_at: string;
  updated_at: string;
}

export function useChildren() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChildren(data || []);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar crianças');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  const createChild = async (childData: {
    name: string;
    gender?: string;
    birth_date?: string;
    avatar_url?: string;
  }) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('children')
      .insert([
        {
          parent_id: user.id,
          ...childData
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    await fetchChildren(); // Refresh the list
    return data;
  };

  const updateChild = async (childId: string, updates: Partial<Child>) => {
    const { data, error } = await supabase
      .from('children')
      .update(updates)
      .eq('id', childId)
      .select()
      .single();

    if (error) throw error;
    
    await fetchChildren(); // Refresh the list
    return data;
  };

  const deleteChild = async (childId: string) => {
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId);

    if (error) throw error;
    
    await fetchChildren(); // Refresh the list
  };

  return {
    children,
    loading,
    error,
    fetchChildren,
    createChild,
    updateChild,
    deleteChild
  };
}