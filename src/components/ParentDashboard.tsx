import { TaskCreationForm } from "./TaskCreationForm";
import { StoreItemCreationForm } from "./StoreItemCreationForm";
import { SpecialMissionCreationForm } from "./SpecialMissionCreationForm";
import { TasksList } from "./TasksList";
import { StoreItemsList } from "./StoreItemsList";
import { PinChangeModal } from "./PinChangeModal";
import { FeedbackForm } from "./FeedbackForm";
import { DonationPage } from "./DonationPage";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Heart, Gift, ArrowLeft } from "lucide-react";

interface ParentDashboardProps {
  onLogout: () => void;
}

export const ParentDashboard = ({ onLogout }: ParentDashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openDialogs, setOpenDialogs] = useState({
    task: false,
    store: false,
    mission: false,
    pinChange: false,
    feedback: false,
    donation: false
  });

  const generateTaskInstances = (data: any) => {
    const instances = [];
    
    const baseTaskData = {
      title: data.title,
      description: data.description,
      points: data.reward,
      child_id: data.child,
      weekdays: data.weekdays,
      time_start: data.timeStart || null,
      time_end: data.timeMode === 'start-end' ? data.timeEnd : null,
      time_mode: data.timeMode,
      duration_minutes: data.timeMode === 'start-duration' ? data.duration : null,
    };

    // Criar instâncias para os próximos 30 dias nos dias da semana selecionados
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30); // Próximos 30 dias
    
    const weekdaysMap = {
      'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 
      'thu': 4, 'fri': 5, 'sat': 6
    };
    
    const selectedWeekdays = data.weekdays?.map((day: string) => weekdaysMap[day as keyof typeof weekdaysMap]) || [];
    
    for (let currentDate = new Date(today); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const dayOfWeek = currentDate.getDay();
      
      if (selectedWeekdays.includes(dayOfWeek)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        instances.push({
          ...baseTaskData,
          due_date: dateStr,
        });
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

  const handleStoreItemSubmit = async (data: {
    name: string;
    description: string;
    cost: number;
    stock?: number;
    image?: File;
  }) => {
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

      let imageUrl = null;

      // Upload image if provided
      if (data.image) {
        const fileExt = data.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('store-items')
          .upload(fileName, data.image);

        if (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          toast({
            title: "Erro",
            description: "Erro ao fazer upload da imagem: " + uploadError.message,
            variant: "destructive",
          });
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('store-items')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('store_items')
        .insert({
          title: data.name,
          description: data.description,
          price: data.cost,
          category: 'general',
          is_available: true,
          created_by: user.id,
          image_url: imageUrl,
        });

      if (error) {
        console.error('Erro ao criar item da loja:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar item da loja: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Item da loja criado com sucesso!",
      });

      setOpenDialogs(prev => ({ ...prev, store: false }));
    } catch (error) {
      console.error('Erro ao criar item da loja:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar item da loja",
        variant: "destructive",
      });
    }
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
      <header className="pixel-border p-4 mb-8 text-center relative">
        <button 
          onClick={() => navigate('/')} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={24} className="text-cyan-400" />
        </button>
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

        {/* Botão Faça uma doação */}
        <Dialog open={openDialogs.donation} onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, donation: open }))}>
          <DialogTrigger asChild>
            <button 
              className="pixel-btn text-yellow-400 w-64 text-xl py-4 flex items-center justify-center gap-2" 
              style={{ borderColor: 'hsl(var(--pixel-yellow))', color: 'hsl(var(--pixel-yellow))' }}
            >
              <Gift size={20} />
              Faça uma doação!
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Apoie este projeto</DialogTitle>
            </DialogHeader>
            <DonationPage onClose={() => setOpenDialogs(prev => ({ ...prev, donation: false }))} />
          </DialogContent>
        </Dialog>

        {/* Botão Ajude-nos a melhorar */}
        <Dialog open={openDialogs.feedback} onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, feedback: open }))}>
          <DialogTrigger asChild>
            <button 
              className="pixel-btn text-pink-400 w-64 text-xl py-4 flex items-center justify-center gap-2" 
              style={{ borderColor: 'hsl(var(--pixel-pink))', color: 'hsl(var(--pixel-pink))' }}
            >
              <Heart size={20} />
              Ajude-nos a melhorar!
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajude-nos a melhorar o aplicativo!</DialogTitle>
            </DialogHeader>
            <FeedbackForm onClose={() => setOpenDialogs(prev => ({ ...prev, feedback: false }))} />
          </DialogContent>
        </Dialog>

        {/* Botão Alterar PIN */}
        <button 
          onClick={() => setOpenDialogs(prev => ({ ...prev, pinChange: true }))} 
          className="pixel-btn text-red-400 w-64 text-xl py-4 flex items-center justify-center gap-2" 
          style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}
        >
          <Settings size={20} />
          Alterar PIN
        </button>

      </main>

      {/* Lista de Tarefas Existentes */}
      <div className="mt-8 max-w-6xl mx-auto px-4">
        <TasksList />
      </div>

      {/* Lista de Itens da Loja */}
      <div className="mt-8 max-w-6xl mx-auto px-4">
        <StoreItemsList />
      </div>

      {/* Modal para alterar PIN */}
      <PinChangeModal 
        open={openDialogs.pinChange} 
        onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, pinChange: open }))} 
      />
    </div>
  );
};