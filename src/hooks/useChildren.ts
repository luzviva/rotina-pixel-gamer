import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Child {
  id: string;
  name: string;
  birth_date: string | null;
  avatar_url: string | null;
  gender: string | null;
  level: number;
  experience_points: number;
  coin_balance: number;
  parent_id: string;
  created_at: string;
  updated_at: string;
}

export const useChildren = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setChildren(data || []);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar crianças');
    } finally {
      setLoading(false);
    }
  };

  const updateChildCoinBalance = async (childId: string, newBalance: number) => {
    try {
      const { error: updateError } = await supabase
        .from('children')
        .update({ 
          coin_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', childId);

      if (updateError) {
        throw updateError;
      }

      // Atualiza o estado local
      setChildren(prevChildren =>
        prevChildren.map(child =>
          child.id === childId
            ? { ...child, coin_balance: newBalance, updated_at: new Date().toISOString() }
            : child
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating child coin balance:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar saldo');
      return false;
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  return {
    children,
    loading,
    error,
    fetchChildren,
    updateChildCoinBalance,
  };
};