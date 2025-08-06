import { useState } from "react";
import { PixelButton } from "./PixelButton";
import { ProgressBar } from "./ProgressBar";
import { useSpecialMissions } from "../hooks/useSpecialMissions";

interface SpecialMissionProps {
  onComplete: (prizeText: string) => void;
  onProgress: (message: string) => void;
}

export const SpecialMission = ({ onComplete, onProgress }: SpecialMissionProps) => {
  const { missions, loading } = useSpecialMissions();
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [prizeClaimed, setPrizeClaimed] = useState(false);
  
  // Pega a primeira missão ativa ou usa valores padrão
  const currentMission = missions.length > 0 ? missions[0] : null;
  const total = currentMission?.description ? parseInt(currentMission.description.match(/\d+/)?.[0] || "5") : 5;
  const prizeAmount = currentMission?.points || 25;
  const missionTitle = currentMission?.title || "Beba 5 copos de água hoje!";

  if (loading) {
    return (
      <div className="pixel-border p-4 mb-6 text-center">
        <h3 className="text-2xl text-purple-400">✨ MISSÃO ESPECIAL ✨</h3>
        <p className="text-xl mt-2">Carregando...</p>
      </div>
    );
  }

  const handleProgressClick = () => {
    if (progress < total && !isCompleted) {
      const newProgress = progress + 1;
      setProgress(newProgress);
      onProgress('+1 Progresso!');
      
      if (newProgress >= total) {
        setIsCompleted(true);
        if (!prizeClaimed) {
          setPrizeClaimed(true);
          onComplete(currentMission?.prize || `+${prizeAmount} Moedas!`);
        }
      }
    }
  };

  return (
    <div className="pixel-border p-4 mb-6 text-center">
      <h3 className="text-2xl text-purple-400">✨ MISSÃO ESPECIAL ✨</h3>
      <p className="text-xl mt-2">{missionTitle}</p>
      
      <div className="my-4 max-w-md mx-auto flex items-center gap-4">
        {!isCompleted && (
          <PixelButton 
            onClick={handleProgressClick}
            className="text-xl p-2 h-12 w-24"
          >
            +1
          </PixelButton>
        )}
        
        <div className="flex-grow">
          <ProgressBar 
            current={progress}
            total={total}
            bgColor="bg-blue-500"
          />
        </div>
      </div>

      {/* Prêmio */}
      <div className="mt-2">
        <p className="text-lg">Prêmio por completar:</p>
        {!isCompleted ? (
          <div className="text-gray-500 inline-block">
            <svg 
              className="w-12 h-12 mx-auto" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V7c0-1.654 1.346-3 3-3z"/>
            </svg>
            <p className="text-sm">Trancado</p>
          </div>
        ) : (
          <div className="text-yellow-400 inline-block animate-pop">
            <svg 
              className="w-12 h-12 mx-auto" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v1H9V7c0-1.654 1.346-3 3-3z"/>
            </svg>
            <p className="text-sm">{currentMission?.prize || `+${prizeAmount} Moedas!`}</p>
          </div>
        )}
      </div>
    </div>
  );
};