import { useState, useEffect } from "react";
import { CoinIcon } from "./CoinIcon";
import { useTasks } from "@/hooks/useTasks";
import { useChildren } from "@/hooks/useChildren";

interface ChildTasksScreenProps {
  coinBalance: number;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export const ChildTasksScreen = ({ coinBalance, onNavigate, onLogout }: ChildTasksScreenProps) => {
  const { children } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const { tasks, loading, getTasksForDate } = useTasks(selectedChildId || undefined);

  // Seleciona automaticamente a primeira criança quando disponível
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = selectedChildId ? children.find(child => child.id === selectedChildId) : null;

  // Cria dados para os dias da semana baseado nas tarefas reais
  const weekDays = [
    { name: "SEG", dayIndex: 1 },
    { name: "TER", dayIndex: 2 },
    { name: "QUA", dayIndex: 3 },
    { name: "QUI", dayIndex: 4 },
    { name: "SEX", dayIndex: 5 },
    { name: "SAB", dayIndex: 6 },
    { name: "DOM", dayIndex: 0 }
  ].map(day => {
    // Cria uma data para o dia da semana
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const dayDiff = day.dayIndex - currentDayOfWeek;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayDiff);
    
    const tasksForDay = getTasksForDate(targetDate);
    
    return {
      name: day.name,
      tasks: tasksForDay.map(task => ({
        id: task.id,
        name: task.title,
        reward: task.points,
        completed: task.is_completed
      }))
    };
  });

  if (loading) {
    return (
      <div className="text-center text-cyan-400 p-8">
        Carregando tarefas...
      </div>
    );
  }

  return (
    <div>
      {/* Header da Criança */}
      <header className="pixel-border p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl text-cyan-400">Olá, Aventureiro!</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-3xl text-yellow-400">
            <CoinIcon className="w-8 h-8" />
            <span>{coinBalance}</span>
          </div>
          <button 
            onClick={() => onNavigate('child-store-screen')} 
            className="pixel-btn"
          >
            Loja
          </button>
          <button 
            onClick={onLogout} 
            className="pixel-btn text-yellow-400" 
            style={{ borderColor: 'hsl(var(--pixel-yellow))', color: 'hsl(var(--pixel-yellow))' }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Quadro de Tarefas Semanal */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {weekDays.map((day, index) => (
          <div key={index} className="pixel-border p-4">
            <h3 className="text-2xl text-center text-yellow-400 mb-4 border-b-4 border-yellow-400 pb-2">
              {day.name}
            </h3>
            {day.tasks.length > 0 ? (
              <div className="space-y-4">
                {day.tasks.map(task => (
                  <div key={task.id} className="bg-gray-800/50 p-3 flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="task-checkbox" 
                      id={`task${task.id}`} 
                      defaultChecked={task.completed}
                    />
                    <label htmlFor={`task${task.id}`} className="flex-1 text-lg">
                      {task.name}
                    </label>
                    <span className="flex items-center gap-1 text-yellow-400 text-lg">
                      <CoinIcon className="w-4 h-4" />
                      {task.reward}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-cyan-400/80 p-6 text-lg">
                Nenhuma tarefa para hoje! Hora de brincar!
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};