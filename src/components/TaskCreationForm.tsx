import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChildren } from "@/hooks/useChildren";

interface TaskFormData {
  title: string;
  description: string;
  reward: number;
  child: string;
  weekdays: string[];
  timeStart?: string;
  timeEnd?: string;
  timeMode: 'start-end' | 'start-duration';
  duration?: number; // em minutos
}

interface TaskCreationFormProps {
  onSubmit: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
}

export const TaskCreationForm = ({ onSubmit, initialData }: TaskCreationFormProps) => {
  const { children, loading } = useChildren();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || 'Escovar os dentes',
    description: initialData?.description || 'Lembre-se de escovar bem por 2 minutos.',
    reward: initialData?.reward || 5,
    child: initialData?.child || '',
    weekdays: initialData?.weekdays || ['mon', 'tue', 'wed', 'thu', 'fri'],
    timeStart: initialData?.timeStart || '08:00',
    timeEnd: initialData?.timeEnd || '08:10',
    timeMode: initialData?.timeMode || 'start-end',
    duration: initialData?.duration || 10,
  });

  // Set first child as default when children are loaded, unless we have initial data
  useEffect(() => {
    if (children.length > 0 && !formData.child && !initialData?.child) {
      setFormData(prev => ({ ...prev, child: children[0].id }));
    }
  }, [children, formData.child, initialData?.child]);

  const toggleWeekday = (day: string) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays?.includes(day) 
        ? prev.weekdays.filter(d => d !== day)
        : [...(prev.weekdays || []), day]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="pixel-border h-[80vh] flex flex-col">
      <div className="p-6 pb-0">
        <h2 className="text-3xl text-yellow-400 mb-6 border-b-4 border-yellow-400 pb-2">Criar Nova Tarefa</h2>
      </div>
      <ScrollArea className="flex-1 px-6">
        <form className="space-y-4 pb-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="task-title" className="text-lg block mb-1">Título da Tarefa</label>
          <input 
            type="text" 
            id="task-title" 
            className="nes-input" 
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="task-desc" className="text-lg block mb-1">Descrição (Opcional)</label>
          <textarea 
            id="task-desc" 
            className="nes-input h-24"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-reward" className="text-lg block mb-1">Recompensa</label>
            <input 
              type="number" 
              id="task-reward" 
              className="nes-input" 
              value={formData.reward}
              onChange={(e) => setFormData(prev => ({ ...prev, reward: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <label htmlFor="task-child" className="text-lg block mb-1">Associar à Criança</label>
            <select 
              id="task-child" 
              className="nes-select"
              value={formData.child}
              onChange={(e) => setFormData(prev => ({ ...prev, child: e.target.value }))}
              disabled={loading}
            >
              {loading ? (
                <option>Carregando crianças...</option>
              ) : children.length === 0 ? (
                <option>Nenhuma criança cadastrada</option>
              ) : (
                children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        
        {/* Configuração de Horários */}
        <div className="space-y-4 border-t border-gray-600 pt-4">
          <h3 className="text-xl text-cyan-400">Horário da Tarefa</h3>
          <div>
            <label className="text-lg block mb-2">Configuração de Tempo</label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-lg cursor-pointer">
                <input 
                  type="radio" 
                  name="time-mode" 
                  value="start-end" 
                  className="nes-radio"
                  checked={formData.timeMode === 'start-end'}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeMode: e.target.value as any }))}
                />
                Início e Fim
              </label>
              <label className="flex items-center gap-2 text-lg cursor-pointer">
                <input 
                  type="radio" 
                  name="time-mode" 
                  value="start-duration" 
                  className="nes-radio"
                  checked={formData.timeMode === 'start-duration'}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeMode: e.target.value as any }))}
                />
                Início e Duração
              </label>
            </div>
          </div>
          
          {formData.timeMode === 'start-end' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="time-start" className="block mb-1">Horário de Início</label>
                <input 
                  type="time" 
                  id="time-start" 
                  className="nes-input"
                  value={formData.timeStart || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeStart: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="time-end" className="block mb-1">Horário de Fim</label>
                <input 
                  type="time" 
                  id="time-end" 
                  className="nes-input"
                  value={formData.timeEnd || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeEnd: e.target.value }))}
                />
              </div>
            </div>
          )}
          
          {formData.timeMode === 'start-duration' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="time-start-duration" className="block mb-1">Horário de Início</label>
                <input 
                  type="time" 
                  id="time-start-duration" 
                  className="nes-input"
                  value={formData.timeStart || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeStart: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="duration" className="block mb-1">Duração (minutos)</label>
                <input 
                  type="number" 
                  id="duration" 
                  className="nes-input"
                  min="1"
                  max="1440"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Seleção de Dias da Semana */}
        <div className="space-y-4 border-t border-gray-600 pt-4">
          <h3 className="text-xl text-cyan-400">Dias da Semana</h3>
          <p className="text-sm text-gray-400 mb-3">Selecione em quais dias da semana esta tarefa deve ser executada:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'sun', label: 'Domingo' },
              { key: 'mon', label: 'Segunda' },
              { key: 'tue', label: 'Terça' },
              { key: 'wed', label: 'Quarta' },
              { key: 'thu', label: 'Quinta' },
              { key: 'fri', label: 'Sexta' },
              { key: 'sat', label: 'Sábado' }
            ].map(day => (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleWeekday(day.key)}
                className={`pixel-btn p-3 text-center transition-colors ${
                  formData.weekdays?.includes(day.key) 
                    ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400' 
                    : 'bg-gray-800/50 text-gray-400 border-gray-600 hover:border-gray-500'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="pixel-btn w-full text-green-400" style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}>
            Salvar Tarefa
          </button>
        </div>
        </form>
      </ScrollArea>
    </div>
  );
};