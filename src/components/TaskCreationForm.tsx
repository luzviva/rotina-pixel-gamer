import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskFormData {
  title: string;
  description: string;
  reward: number;
  child_id: string;
  difficulty: string;
  category: string;
}

interface TaskCreationFormProps {
  onSubmit: (data: any) => void;
}

export const TaskCreationForm = ({ onSubmit }: TaskCreationFormProps) => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    reward: 10,
    child_id: '',
    difficulty: 'easy',
    category: 'general'
  });

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;
    
    setLoadingChildren(true);
    const { data, error } = await supabase
      .from('children')
      .select('id, name')
      .eq('parent_id', user.id);
    
    setLoadingChildren(false);
    
    if (!error && data) {
      setChildren(data);
      // Auto-select first child if only one exists
      if (data.length === 1) {
        setFormData(prev => ({ ...prev, child_id: data[0].id }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.child_id) {
      alert('Por favor, selecione uma criança');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('Por favor, preencha o título da tarefa');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            child_id: formData.child_id,
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            points: formData.reward,
            difficulty: formData.difficulty,
            category: formData.category,
            created_by: user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setFormData({
        title: '',
        description: '',
        reward: 10,
        child_id: children.length === 1 ? children[0].id : '',
        difficulty: 'easy',
        category: 'general'
      });

      onSubmit(data);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa. Tente novamente.');
    }
  };

  return (
    <div className="pixel-border h-[80vh] flex flex-col">
      <div className="p-6 pb-0">
        <h2 className="text-3xl text-yellow-400 mb-6 border-b-4 border-yellow-400 pb-2">Criar Nova Tarefa</h2>
      </div>
      <ScrollArea className="flex-1 px-6">
        <form className="space-y-6 pb-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-cyan-400 font-bold mb-2">
              Título da Tarefa
            </label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-black/40 border-4 border-cyan-400 p-3 text-white focus:outline-none focus:border-yellow-400"
              placeholder="Ex: Arrumar a cama"
            />
          </div>

          <div>
            <label className="block text-cyan-400 font-bold mb-2">
              Descrição (Opcional)
            </label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-black/40 border-4 border-cyan-400 p-3 text-white focus:outline-none focus:border-yellow-400 h-24"
              placeholder="Deixar o quarto organizado..."
            />
          </div>

          <div>
            <label className="block text-cyan-400 font-bold mb-2">
              Criança Responsável
            </label>
            <select
              value={formData.child_id}
              onChange={(e) => setFormData(prev => ({ ...prev, child_id: e.target.value }))}
              className="w-full bg-black/40 border-4 border-cyan-400 p-3 text-white focus:outline-none focus:border-yellow-400"
              disabled={loadingChildren}
            >
              <option value="">
                {loadingChildren ? 'Carregando...' : 'Selecione uma criança'}
              </option>
              {children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
            {children.length === 0 && !loadingChildren && (
              <p className="text-red-400 text-sm mt-1">
                Nenhuma criança encontrada. Crie um perfil primeiro.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cyan-400 font-bold mb-2">
                Recompensa (Moedas)
              </label>
              <input 
                type="number" 
                min="1"
                max="100"
                value={formData.reward}
                onChange={(e) => setFormData(prev => ({ ...prev, reward: parseInt(e.target.value) || 1 }))}
                className="w-full bg-black/40 border-4 border-cyan-400 p-3 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-cyan-400 font-bold mb-2">
                Dificuldade
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full bg-black/40 border-4 border-cyan-400 p-3 text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-cyan-400 font-bold mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-black/40 border-4 border-cyan-400 p-3 text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="general">Geral</option>
              <option value="hygiene">Higiene</option>
              <option value="study">Estudos</option>
              <option value="chores">Tarefas Domésticas</option>
              <option value="exercise">Exercícios</option>
            </select>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full pixel-btn text-green-400" 
              style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
              disabled={loadingChildren || children.length === 0}
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
};