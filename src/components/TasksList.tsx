import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useChildren } from "@/hooks/useChildren";
import { Trash2, Edit, Filter, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { TaskCreationForm } from "./TaskCreationForm";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

interface Task {
  id: string;
  title: string;
  description: string | null;
  points: number;
  child_id: string;
  due_date: string | null;
  time_start: string | null;
  time_end: string | null;
  weekdays: string[] | null;
  is_completed: boolean;
  is_visible: boolean;
  created_at: string;
}

export const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Estados dos filtros
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [childFilter, setChildFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Estados da seleção múltipla
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
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

  // Aplicar filtros sempre que as tarefas ou filtros mudarem
  useEffect(() => {
    let filtered = [...tasks];

    // Filtro por status
    if (statusFilter === 'pending') {
      filtered = filtered.filter(task => !task.is_completed);
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(task => task.is_completed);
    }

    // Filtro por criança
    if (childFilter !== 'all') {
      filtered = filtered.filter(task => task.child_id === childFilter);
    }

    // Filtro por data
    if (dateFilter) {
      filtered = filtered.filter(task => task.due_date === dateFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, childFilter, dateFilter]);

  const clearFilters = () => {
    setStatusFilter('all');
    setChildFilter('all');
    setDateFilter('');
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedTasks(new Set());
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const selectAllTasks = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    
    if (!confirm(`Tem certeza que deseja excluir ${selectedTasks.size} tarefa(s)?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', Array.from(selectedTasks));

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${selectedTasks.size} tarefa(s) excluída(s) com sucesso!`,
      });

      setSelectedTasks(new Set());
      fetchTasks();
    } catch (error) {
      console.error('Erro ao excluir tarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir tarefas",
        variant: "destructive",
      });
    }
  };

  const handleBulkToggleVisibility = async (makeVisible: boolean) => {
    if (selectedTasks.size === 0) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_visible: makeVisible })
        .in('id', Array.from(selectedTasks));

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${selectedTasks.size} tarefa(s) ${makeVisible ? 'mostrada(s)' : 'ocultada(s)'} com sucesso!`,
      });

      setSelectedTasks(new Set());
      fetchTasks();
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar visibilidade das tarefas",
        variant: "destructive",
      });
    }
  };

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
        {isExpanded ? (
          <>
            <div className="flex justify-between items-center mb-6 border-b-4 border-yellow-400 pb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  title="Recolher lista"
                >
                  <ChevronUp size={20} />
                </button>
                <h3 className="text-2xl text-yellow-400">
                  Tarefas Existentes ({filteredTasks.length} de {tasks.length})
                </h3>
                {selectedTasks.size > 0 && (
                  <span className="text-cyan-400 text-sm">
                    ({selectedTasks.size} selecionada(s))
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleSelectionMode}
                  variant={isSelectionMode ? "default" : "outline"}
                  size="sm"
                >
                  {isSelectionMode ? 'Cancelar Seleção' : 'Selecionar'}
                </Button>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Filter size={16} />
                  {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
              </div>
            </div>

            {/* Ações em lote */}
            {isSelectionMode && selectedTasks.size > 0 && (
              <div className="bg-slate-800/30 border border-cyan-400/30 rounded p-4 mb-6">
                <h4 className="text-lg text-cyan-400 mb-4">Ações em Lote</h4>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleBulkDelete}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Excluir Selecionadas
                  </Button>
                  <Button
                    onClick={() => handleBulkToggleVisibility(false)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <EyeOff size={16} />
                    Ocultar
                  </Button>
                  <Button
                    onClick={() => handleBulkToggleVisibility(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Mostrar
                  </Button>
                </div>
              </div>
            )}

            {/* Seção de Filtros */}
            {showFilters && (
              <div className="bg-slate-800/30 border border-cyan-400/30 rounded p-4 mb-6">
                <h4 className="text-lg text-cyan-400 mb-4">Filtros</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por Status */}
                  <div>
                    <label className="text-white/80 block mb-2">Status</label>
                    <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'completed') => setStatusFilter(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="completed">Concluídas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Criança */}
                  <div>
                    <label className="text-white/80 block mb-2">Criança</label>
                    <Select value={childFilter} onValueChange={setChildFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a criança" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as crianças</SelectItem>
                        {children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Data */}
                  <div>
                    <label className="text-white/80 block mb-2">Data</label>
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-slate-800 border-cyan-400/30"
                    />
                  </div>
                </div>

                {/* Botão para limpar filtros */}
                <div className="mt-4">
                  <Button 
                    onClick={clearFilters} 
                    variant="outline" 
                    size="sm"
                    className="text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}
            
            {tasks.length === 0 ? (
              <p className="text-cyan-400/80 text-center py-8">
                Nenhuma tarefa criada ainda. Crie sua primeira tarefa usando o botão acima!
              </p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-cyan-400/80 text-center py-8">
                Nenhuma tarefa encontrada com os filtros selecionados.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Cabeçalho com seleção geral */}
                {isSelectionMode && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 border border-cyan-400/20 rounded">
                    <Checkbox
                      checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                      onCheckedChange={selectAllTasks}
                    />
                    <span className="text-cyan-400 text-sm">
                      Selecionar todas ({filteredTasks.length})
                    </span>
                  </div>
                )}
                
                {filteredTasks.map((task) => (
                  <div key={task.id} className={`bg-slate-800/50 border-2 p-4 rounded transition-colors ${
                    selectedTasks.has(task.id) 
                      ? 'border-cyan-400 bg-cyan-400/10' 
                      : 'border-cyan-400/30'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedTasks.has(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                          />
                        )}
                        <div>
                          <h4 className="text-xl text-cyan-400 font-bold flex items-center gap-2">
                            {task.title}
                            {!task.is_visible && (
                              <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded border border-orange-400/30">
                                OCULTA
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>
                      {!isSelectionMode && (
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
                      )}
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
                      <div className="text-xs text-white/60">
                        {task.weekdays && task.weekdays.length > 0 && (
                          <span>Dias: {task.weekdays.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Versão recolhida - apenas cabeçalho compacto
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                title="Expandir lista"
              >
                <ChevronDown size={20} />
              </button>
              <h3 className="text-lg text-yellow-400">
                Tarefas ({filteredTasks.length} de {tasks.length})
              </h3>
            </div>
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
            <TaskCreationForm 
              onSubmit={handleUpdateTask}
              initialData={{
                title: editingTask.title,
                description: editingTask.description || '',
                reward: editingTask.points,
                child: editingTask.child_id,
                weekdays: editingTask.weekdays || [],
                timeStart: editingTask.time_start?.slice(0, 5) || '', // Remove seconds
                timeEnd: editingTask.time_end?.slice(0, 5) || '', // Remove seconds
                timeMode: 'start-end' as const,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};