import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SpecialMission {
  id: string;
  title: string;
  description: string | null;
  points: number;
  prize: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useSpecialMissions = () => {
  const [missions, setMissions] = useState<SpecialMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('special_missions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setMissions(data || []);
    } catch (err) {
      console.error('Error fetching special missions:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar missões especiais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return {
    missions,
    loading,
    error,
    fetchMissions,
  };
};