import { TaskCreationForm } from "./TaskCreationForm";
import { StoreItemCreationForm } from "./StoreItemCreationForm";
import { SpecialMissionCreationForm } from "./SpecialMissionCreationForm";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ParentDashboardProps {
  onLogout: () => void;
}

export const ParentDashboard = ({ onLogout }: ParentDashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openDialogs, setOpenDialogs] = useState({
    task: false,
    store: false,
    mission: false
  });

  const generateTaskInstances = (data: any) => {
    const instances = [];
    
    const baseTaskData = {
      title: data.title,
      description: data.description,
      points: data.reward,
      child_id: data.child,
      frequency: data.frequency,
      time_start: data.timeStart || null,
      time_end: data.timeMode === 'start-end' ? data.timeEnd : null,
      time_mode: data.timeMode,
      duration_minutes: data.timeMode === 'start-duration' ? data.duration : null,
    };

    if (data.frequency === 'UNICA') {
      // Tarefa única: criar apenas uma instância
      instances.push({
        ...baseTaskData,
        due_date: data.specificDate,
        date_start: data.specificDate,
        date_end: data.specificDate,
      });
    } else if (data.frequency === 'DIARIA') {
      // Tarefa diária: criar uma instância para cada dia
      const startDate = new Date(data.dateStart);
      const endDate = new Date(data.dateEnd);
      
      for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        instances.push({
          ...baseTaskData,
          due_date: dateStr,
          date_start: data.dateStart,
          date_end: data.dateEnd,
        });
      }
    } else if (data.frequency === 'SEMANAL') {
      // Tarefa semanal: criar uma instância para cada dia da semana selecionado
      const startDate = new Date(data.dateStart);
      const endDate = new Date(data.dateEnd);
      const weekdaysMap = {
        'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 
        'thu': 4, 'fri': 5, 'sat': 6
      };
      
      const selectedWeekdays = data.weekdays?.map((day: string) => weekdaysMap[day as keyof typeof weekdaysMap]) || [];
      
      for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const dayOfWeek = currentDate.getDay();
        
        if (selectedWeekdays.includes(dayOfWeek)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          instances.push({
            ...baseTaskData,
            due_date: dateStr,
            date_start: data.dateStart,
            date_end: data.dateEnd,
            weekdays: data.weekdays,
          });
        }
      }
    }
    
    return instances;
  };

  const handleTaskSubmit = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Gerar todas as instâncias da tarefa
      const taskInstances = generateTaskInstances(data);
      
      // Adicionar created_by a cada instância
      const tasksToInsert = taskInstances.map(instance => ({
        ...instance,
        created_by: user.id,
      }));

      const { error } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (error) {
        console.error('Erro ao criar tarefa:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar tarefa: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Tarefa criada com sucesso! ${tasksToInsert.length} instância(s) criada(s).`,
      });

      setOpenDialogs(prev => ({ ...prev, task: false }));
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro", 
        description: "Erro ao criar tarefa",
        variant: "destructive",
      });
    }
  };

  const handleStoreItemSubmit = (data: any) => {
    console.log('Novo item da loja:', data);
    // Aqui implementaria a lógica para salvar o item da loja
    setOpenDialogs(prev => ({ ...prev, store: false }));
  };

  const handleSpecialMissionSubmit = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Calcular pontos baseado no tipo de prêmio
      let points = 0;
      if (data.prizeType === 'coins') {
        points = data.coinsAmount || 25;
      } else {
        points = 50; // Valor padrão para outros tipos de prêmio
      }

      // Determinar o prêmio baseado no tipo
      let prize = '';
      if (data.prizeType === 'coins') {
        prize = `${data.coinsAmount} moedas`;
      } else if (data.prizeType === 'store-item') {
        prize = data.storeItem || '';
      } else {
        prize = data.textDescription || '';
      }

      const { error } = await supabase
        .from('special_missions')
        .insert({
          title: data.title,
          description: `Execuções necessárias: ${data.executions}`,
          points,
          prize,
          created_by: user.id,
          is_active: true,
        });

      if (error) {
        console.error('Erro ao criar missão especial:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar missão especial: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Missão especial criada com sucesso!",
      });

      setOpenDialogs(prev => ({ ...prev, mission: false }));
    } catch (error) {
      console.error('Erro ao criar missão especial:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar missão especial",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <header className="pixel-border p-4 mb-8 text-center">
        <h1 className="text-3xl text-cyan-400">Painel dos Pais</h1>
      </header>

      <main className="flex flex-col items-center space-y-6">
        {/* Botão Criar Tarefa */}
        <Dialog open={openDialogs.task} onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, task: open }))}>
          <DialogTrigger asChild>
            <button className="pixel-btn text-red-400 w-64 text-xl py-4" style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}>
              Criar Tarefa
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <TaskCreationForm onSubmit={handleTaskSubmit} />
          </DialogContent>
        </Dialog>

        {/* Botão Criar Item da Loja */}
        <Dialog open={openDialogs.store} onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, store: open }))}>
          <DialogTrigger asChild>
            <button className="pixel-btn text-red-400 w-64 text-xl py-4" style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}>
              Criar Item da Loja
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Item da Loja</DialogTitle>
            </DialogHeader>
            <StoreItemCreationForm onSubmit={handleStoreItemSubmit} />
          </DialogContent>
        </Dialog>

        {/* Botão Criar Missão Especial */}
        <Dialog open={openDialogs.mission} onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, mission: open }))}>
          <DialogTrigger asChild>
            <button className="pixel-btn text-red-400 w-64 text-xl py-4" style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}>
              Criar Missão Especial
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Missão Especial</DialogTitle>
            </DialogHeader>
            <SpecialMissionCreationForm onSubmit={handleSpecialMissionSubmit} />
          </DialogContent>
        </Dialog>

        {/* Botão Criar Perfil */}
        <button 
          onClick={() => navigate('/novoperfil')} 
          className="pixel-btn text-red-400 w-64 text-xl py-4" 
          style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}
        >
          Criar Perfil
        </button>

        {/* Botão Sair */}
        <button 
          onClick={onLogout} 
          className="pixel-btn text-red-400 w-64 text-xl py-4" 
          style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}
        >
          Sair
        </button>
      </main>
    </div>
  );
};