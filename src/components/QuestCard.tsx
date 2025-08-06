import { TaskCheckbox } from "./TaskCheckbox";
import { CoinIcon } from "./CoinIcon";

interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  timeStart?: string | null;
  timeEnd?: string | null;
  timeMode?: 'start-end' | 'start-duration';
  durationMinutes?: number | null;
  dueDate?: string | null;
  onToggle: (completed: boolean) => void;
}

export const QuestCard = ({ 
  id, 
  title, 
  description, 
  reward, 
  completed,
  timeStart,
  timeEnd,
  timeMode,
  durationMinutes,
  dueDate,
  onToggle 
}: QuestCardProps) => {
  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove os segundos, fica HH:MM
  };

  const getTimeDisplay = () => {
    if (!timeStart) return null;
    
    if (timeMode === 'start-duration' && durationMinutes) {
      return `${formatTime(timeStart)} (${durationMinutes}min)`;
    } else if (timeMode === 'start-end' && timeEnd) {
      return `${formatTime(timeStart)} - ${formatTime(timeEnd)}`;
    } else {
      return formatTime(timeStart);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate(); // Retorna apenas o dia do mês
  };

  const getDateDisplay = () => {
    if (!dueDate) return null;
    return `Dia ${formatDate(dueDate)}`;
  };
  return (
    <div 
      id={`quest-card-${id}`} 
      className={`quest-card ${completed ? 'completed' : ''}`}
    >
      <TaskCheckbox 
        id={`task${id}`}
        checked={completed}
        onChange={onToggle}
      />
      <div className="flex-grow">
        <label htmlFor={`task${id}`} className="text-2xl cursor-pointer">
          {title}
        </label>
        <p className="text-base text-cyan-300">
          {description}
        </p>
        {getTimeDisplay() && (
          <p className="text-sm text-yellow-300 mt-1">
            🕒 {getTimeDisplay()}
          </p>
        )}
      </div>
      <div className="text-2xl text-yellow-400 flex items-center gap-2">
        +{reward}
        <CoinIcon className="w-6 h-6" />
      </div>
    </div>
  );
};