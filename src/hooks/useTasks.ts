import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  points: number;
  is_completed: boolean;
  is_visible: boolean;
  due_date: string | null;
  child_id: string;
  created_by: string;
  created_by_name: string | null;
  frequency: 'DIARIA' | 'SEMANAL' | 'UNICA' | 'DATAS_ESPECIFICAS';
  date_start: string | null;
  date_end: string | null;
  weekdays: string[] | null;
  specific_dates: string[] | null;
  time_start: string | null;
  time_end: string | null;
  time_mode: 'start-end' | 'start-duration';
  duration_minutes: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useTasks = (childId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('tasks')
        .select(`
          *,
          profiles:created_by (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (childId) {
        query = query.eq('child_id', childId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Processar os dados para incluir o display_name
      const processedTasks = (data || []).map(task => ({
        ...task,
        created_by_name: task.profiles?.display_name || null
      }));

      setTasks(processedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    try {
      const updateData: any = {
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      };

      if (isCompleted) {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (updateError) {
        throw updateError;
      }

      // Atualiza o estado local
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { 
                ...task, 
                is_completed: isCompleted,
                completed_at: isCompleted ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
              }
            : task
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
      return false;
    }
  };

  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      // Agora que criamos instâncias individuais com due_date,
      // basta filtrar pelo due_date que corresponde à data selecionada
      // E apenas tarefas visíveis aparecem na visão da criança
      return task.due_date === dateString && task.is_visible;
    });
  };

  useEffect(() => {
    fetchTasks();
  }, [childId]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    updateTaskCompletion,
    getTasksForDate,
  };
};