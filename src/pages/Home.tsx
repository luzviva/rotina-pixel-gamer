import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PixelAvatar } from "../components/PixelAvatar";
import { CoinIcon } from "../components/CoinIcon";
import { ProgressBar } from "../components/ProgressBar";
import { PixelButton } from "../components/PixelButton";
import { QuestCard } from "../components/QuestCard";
import { WeekView } from "../components/WeekView";
import { FeedbackModal } from "../components/FeedbackModal";
import { SpecialMission } from "../components/SpecialMission";
import { Settings, ShoppingCart, LogOut } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { useChildren } from "../hooks/useChildren";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { children, loading: childrenLoading, updateChildCoinBalance } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const { tasks: allTasks, loading: tasksLoading, error, updateTaskCompletion, getTasksForDate } = useTasks(selectedChildId || undefined);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 7, 5));
  const [isToday, setIsToday] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Seleciona automaticamente a primeira criança quando disponível
  const selectedChild = selectedChildId ? children.find(child => child.id === selectedChildId) : null;
  const coinBalance = selectedChild?.coin_balance || 0;

  const dayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const dayTitleNames = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Pega as tarefas para a data selecionada
  const tasksForSelectedDate = getTasksForDate(selectedDate);
  const completedTasks = tasksForSelectedDate.filter(task => task.is_completed).length;
  const totalTasks = tasksForSelectedDate.length;

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    // Seleciona automaticamente a primeira criança quando disponível
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const showFeedbackMessage = (message: string) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task || !selectedChild) return;

    if (completed) {
      // Marca como completa e adiciona moedas
      const success = await updateTaskCompletion(taskId, true);
      if (success) {
        const newBalance = coinBalance + task.points;
        await updateChildCoinBalance(selectedChild.id, newBalance);
        showFeedbackMessage(`+${task.points} Moedas!`);
      }
    } else {
      // Verifica se pode desmarcar
      if (coinBalance >= task.points) {
        const success = await updateTaskCompletion(taskId, false);
        if (success) {
          const newBalance = coinBalance - task.points;
          await updateChildCoinBalance(selectedChild.id, newBalance);
        }
      } else {
        showFeedbackMessage('Moedas já gastas!');
      }
    }
  };

  const handleDateSelect = (date: Date, todaySelected: boolean) => {
    setSelectedDate(date);
    setIsToday(todaySelected);
  };

  const handleSpecialMissionComplete = async (prizeAmount: number) => {
    if (!selectedChild) return;
    const newBalance = coinBalance + prizeAmount;
    await updateChildCoinBalance(selectedChild.id, newBalance);
    showFeedbackMessage(`PRÊMIO! +${prizeAmount} Moedas!`);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleStoreClick = () => {
    navigate('/loja');
  };

  const formatDate = () => {
    const dayIndex = selectedDate.getDay();
    return `${dayNames[dayIndex]}, ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]} de ${selectedDate.getFullYear()}`;
  };

  const getMissionTitle = () => {
    if (isToday) {
      return "MISSÕES DE HOJE";
    } else {
      const dayIndex = selectedDate.getDay();
      return `MISSÕES DE ${dayTitleNames[dayIndex]}`;
    }
  };

  // Se ainda estiver carregando auth, mostra loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-cyan-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div className="max-w-4xl mx-auto">
        {/* CABEÇALHO DO AVENTUREIRO */}
        <header className="pixel-border p-2 md:p-3 mb-8 flex items-center gap-2 md:gap-4">
          <PixelAvatar />
          
          {/* Informações Centrais */}
          <div className="flex-grow">
            <div className="flex justify-between items-baseline mb-1">
              <h1 className="text-xl md:text-2xl text-cyan-400">{selectedChild?.name || "Aventureiro"}</h1>
              <div className="flex items-center gap-1 text-xl md:text-2xl text-yellow-400">
                <CoinIcon />
                <span>{coinBalance}</span>
              </div>
            </div>
            <ProgressBar 
              current={completedTasks}
              total={totalTasks}
              className="h-3 md:h-4"
            />
          </div>
        
          {/* Botões Direita */}
          <div className="flex items-center gap-2">
            <PixelButton 
              className="text-sm p-2 flex items-center"
              aria-label="Loja"
              onClick={handleStoreClick}
            >
              <ShoppingCart className="w-6 h-6" />
            </PixelButton>
            
            <PixelButton 
              className="text-sm p-2 flex items-center"
              aria-label="Configurações"
              onClick={handleSettingsClick}
            >
              <Settings className="w-6 h-6" />
            </PixelButton>

            <PixelButton 
              className="text-sm p-2 flex items-center"
              aria-label="Sair"
              onClick={signOut}
            >
              <LogOut className="w-6 h-6" />
            </PixelButton>
          </div>
        </header>

        {/* PAINEL DE MISSÕES */}
        <main>
          {/* SELETOR DE CRIANÇA */}
          {children.length > 1 && (
            <div className="mb-6">
              <div className="pixel-border p-4 text-center">
                <h3 className="text-xl text-cyan-400 mb-4">Selecionar Aventureiro</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {children.map(child => (
                    <PixelButton
                      key={child.id}
                      className={`px-4 py-2 ${selectedChildId === child.id ? 'bg-cyan-500/20' : ''}`}
                      onClick={() => setSelectedChildId(child.id)}
                    >
                      {child.name}
                    </PixelButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MISSÃO ESPECIAL DO DIA */}
          <SpecialMission 
            onComplete={handleSpecialMissionComplete}
            onProgress={showFeedbackMessage}
          />

          {/* Seletor de Dias da Semana */}
          <WeekView onDateSelect={handleDateSelect} />

          <div className="text-center mb-6">
            <h2 className="text-4xl text-yellow-400">{getMissionTitle()}</h2>
            <p className="text-xl text-cyan-400">{formatDate()}</p>
          </div>

          <div className="space-y-6">
            {childrenLoading ? (
              <div className="text-center text-cyan-400">Carregando crianças...</div>
            ) : children.length === 0 ? (
              <div className="text-center text-cyan-400/80 p-6 text-lg">
                Nenhuma criança cadastrada! Cadastre uma criança primeiro.
              </div>
            ) : !selectedChild ? (
              <div className="text-center text-cyan-400">Selecione uma criança</div>
            ) : tasksLoading ? (
              <div className="text-center text-cyan-400">Carregando tarefas...</div>
            ) : error ? (
              <div className="text-center text-red-400">Erro: {error}</div>
            ) : tasksForSelectedDate.length === 0 ? (
              <div className="text-center text-cyan-400/80 p-6 text-lg">
                Nenhuma tarefa para este dia! Hora de brincar!
              </div>
            ) : (
              tasksForSelectedDate
                .sort((a, b) => {
                  // Se uma tarefa não tem horário, vai para o final
                  if (!a.time_start && !b.time_start) return 0;
                  if (!a.time_start) return 1;
                  if (!b.time_start) return -1;
                  
                  // Compara os horários
                  return a.time_start.localeCompare(b.time_start);
                })
                .map(task => (
                <QuestCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description || ""}
                  reward={task.points}
                  completed={task.is_completed}
                  timeStart={task.time_start}
                  timeEnd={task.time_end}
                  timeMode={task.time_mode}
                  durationMinutes={task.duration_minutes}
                  dueDate={task.due_date}
                  onToggle={(completed) => handleTaskToggle(task.id, completed)}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Modal de feedback */}
      <FeedbackModal 
        message={feedbackMessage}
        isVisible={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  );
};

export default Home;