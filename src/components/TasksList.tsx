import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import { Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { TaskCreationForm } from "./TaskCreationForm";

interface Task {
  id: string;
  title: string;
  description: string | null;
  points: number;
  child_id: string;
  due_date: string | null;
  time_start: string | null;
  time_end: string | null;
  frequency: string;
  is_completed: boolean;
  created_at: string;
}

export const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();
  const { children } = useChildren();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso!",
      });

      fetchTasks(); // Atualizar a lista
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir tarefa",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowEditDialog(true);
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: data.title,
          description: data.description,
          points: data.reward,
          child_id: data.child,
          time_start: data.timeStart || null,
          time_end: data.timeMode === 'start-end' ? data.timeEnd : null,
          duration_minutes: data.timeMode === 'start-duration' ? data.duration : null,
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!",
      });

      setShowEditDialog(false);
      setEditingTask(null);
      fetchTasks(); // Atualizar a lista
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive",
      });
    }
  };

  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child?.name || 'Criança não encontrada';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return timeString.slice(0, 5); // HH:MM
  };

  if (loading) {
    return (
      <div className="pixel-border p-6">
        <h3 className="text-2xl text-yellow-400 mb-4">Carregando tarefas...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="pixel-border p-6 mt-8">
        <h3 className="text-2xl text-yellow-400 mb-6 border-b-4 border-yellow-400 pb-2">
          Tarefas Existentes ({tasks.length})
        </h3>
        
        {tasks.length === 0 ? (
          <p className="text-cyan-400/80 text-center py-8">
            Nenhuma tarefa criada ainda. Crie sua primeira tarefa usando o botão acima!
          </p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-slate-800/50 border-2 border-cyan-400/30 p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl text-cyan-400 font-bold">{task.title}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      title="Editar tarefa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Excluir tarefa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-white/80 mb-3">{task.description}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-400">Recompensa:</span>
                    <p className="text-white">{task.points} moedas</p>
                  </div>
                  <div>
                    <span className="text-yellow-400">Criança:</span>
                    <p className="text-white">{getChildName(task.child_id)}</p>
                  </div>
                  <div>
                    <span className="text-yellow-400">Data:</span>
                    <p className="text-white">{formatDate(task.due_date)}</p>
                  </div>
                  <div>
                    <span className="text-yellow-400">Horário:</span>
                    <p className="text-white">
                      {task.time_start ? `${formatTime(task.time_start)} - ${formatTime(task.time_end)}` : '-'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <span className={`text-sm px-2 py-1 rounded ${
                    task.is_completed 
                      ? 'bg-green-600/20 text-green-400 border border-green-400/30' 
                      : 'bg-orange-600/20 text-orange-400 border border-orange-400/30'
                  }`}>
                    {task.is_completed ? 'Concluída' : 'Pendente'}
                  </span>
                  <span className="text-xs text-white/60">
                    Frequência: {task.frequency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para editar tarefa */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskCreationForm onSubmit={handleUpdateTask} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};