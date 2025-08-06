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
import { Settings, ShoppingCart } from "lucide-react";
import { useTasks } from "../hooks/useTasks";

const Home = () => {
  const navigate = useNavigate();
  const [coinBalance, setCoinBalance] = useState(125);
  const { tasks: allTasks, loading, error, updateTaskCompletion, getTasksForDate } = useTasks();

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 7, 5));
  const [isToday, setIsToday] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

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

  const showFeedbackMessage = (message: string) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    if (completed) {
      // Marca como completa e adiciona moedas
      const success = await updateTaskCompletion(taskId, true);
      if (success) {
        setCoinBalance(prev => prev + task.points);
        showFeedbackMessage(`+${task.points} Moedas!`);
      }
    } else {
      // Verifica se pode desmarcar
      if (coinBalance >= task.points) {
        const success = await updateTaskCompletion(taskId, false);
        if (success) {
          setCoinBalance(prev => prev - task.points);
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

  const handleSpecialMissionComplete = (prizeAmount: number) => {
    setCoinBalance(prev => prev + prizeAmount);
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

  return (
    <div className={`p-4 md:p-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div className="max-w-4xl mx-auto">
        {/* CABEÇALHO DO AVENTUREIRO */}
        <header className="pixel-border p-2 md:p-3 mb-8 flex items-center gap-2 md:gap-4">
          <PixelAvatar />
          
          {/* Informações Centrais */}
          <div className="flex-grow">
            <div className="flex justify-between items-baseline mb-1">
              <h1 className="text-xl md:text-2xl text-cyan-400">Aventureiro</h1>
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
          </div>
        </header>

        {/* PAINEL DE MISSÕES */}
        <main>
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
            {loading ? (
              <div className="text-center text-cyan-400">Carregando tarefas...</div>
            ) : error ? (
              <div className="text-center text-red-400">Erro: {error}</div>
            ) : tasksForSelectedDate.length === 0 ? (
              <div className="text-center text-cyan-400/80 p-6 text-lg">
                Nenhuma tarefa para este dia! Hora de brincar!
              </div>
            ) : (
              tasksForSelectedDate.map(task => (
                <QuestCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description || ""}
                  reward={task.points}
                  completed={task.is_completed}
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