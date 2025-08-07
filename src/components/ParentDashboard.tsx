import { TaskCreationForm } from "./TaskCreationForm";
import { StoreItemCreationForm } from "./StoreItemCreationForm";
import { SpecialMissionCreationForm } from "./SpecialMissionCreationForm";
import { TasksList } from "./TasksList";
import { StoreItemsList } from "./StoreItemsList";
import { PinChangeModal } from "./PinChangeModal";
import { PasswordChangeModal } from "./PasswordChangeModal";
import { FeedbackForm } from "./FeedbackForm";
import { DonationPage } from "./DonationPage";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Heart, Gift, ArrowLeft, KeyRound, Upload } from "lucide-react";
import { useChildren } from "@/hooks/useChildren";

interface ParentDashboardProps {
  onLogout: () => void;
}

export const ParentDashboard = ({ onLogout }: ParentDashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { children } = useChildren();
  const [openDialogs, setOpenDialogs] = useState({
    task: false,
    store: false,
    mission: false,
    pinChange: false,
    passwordChange: false,
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
      time_start: data.timeStart || null,
      time_end: data.timeMode === 'start-end' ? data.timeEnd : null,
      time_mode: data.timeMode,
      duration_minutes: data.timeMode === 'start-duration' ? data.duration : null,
      frequency: 'SEMANAL',
    };

    // Criar uma instância para cada dia da semana selecionado
    const weekdaysMap = {
      'sun': 'Domingo', 'mon': 'Segunda', 'tue': 'Terça', 'wed': 'Quarta', 
      'thu': 'Quinta', 'fri': 'Sexta', 'sat': 'Sábado'
    };
    
    // Criar uma tarefa para cada dia da semana selecionado
    data.weekdays?.forEach((weekday: string) => {
      instances.push({
        ...baseTaskData,
        weekdays: [weekday], // Armazena apenas o dia específico desta instância
        due_date: null, // Não associa a uma data específica
      });
    });
    
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

  const loadInitialTasks = async () => {
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

      if (children.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma criança encontrada. Crie um perfil primeiro.",
          variant: "destructive",
        });
        return;
      }

      // Buscar todas as tarefas iniciais usando RPC
      const { data: initialTasks, error: fetchError } = await supabase
        .rpc('get_initial_tasks');

      if (fetchError) {
        console.error('Error fetching initial tasks:', fetchError);
        toast({
          title: "Erro",
          description: "Erro ao buscar tarefas iniciais: " + fetchError.message,
          variant: "destructive",
        });
        return;
      }

      if (!initialTasks || initialTasks.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma tarefa inicial encontrada.",
        });
        return;
      }

      // Criar tarefas para todas as crianças
      const allTasksToCreate = [];
      for (const child of children) {
        const tasksForChild = initialTasks.map((task: any) => ({
          title: task.title,
          description: task.description,
          points: task.points || 10,
          child_id: child.id,
          created_by: user.id,
          frequency: task.frequency || 'SEMANAL',
          weekdays: task.weekdays,
          time_start: task.time_start,
          time_end: task.time_end,
          time_mode: task.time_mode || 'start-end',
          duration_minutes: task.duration_minutes,
          is_visible: task.is_visible !== false,
          is_completed: false
        }));
        allTasksToCreate.push(...tasksForChild);
      }

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(allTasksToCreate);

      if (insertError) {
        console.error('Error creating initial tasks:', insertError);
        toast({
          title: "Erro",
          description: "Erro ao criar tarefas iniciais: " + insertError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `${allTasksToCreate.length} tarefas iniciais carregadas com sucesso para ${children.length} criança(s)!`,
      });

    } catch (error) {
      console.error('Error in loadInitialTasks:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas iniciais",
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

        {/* Botão Carregar Tarefas Iniciais */}
        <button 
          onClick={loadInitialTasks}
          className="pixel-btn text-green-400 w-64 text-xl py-4 flex items-center justify-center gap-2" 
          style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
        >
          <Upload size={20} />
          Carregar Tarefas Iniciais
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

        {/* Botão Alterar Senha */}
        <button 
          onClick={() => setOpenDialogs(prev => ({ ...prev, passwordChange: true }))} 
          className="pixel-btn text-red-400 w-64 text-xl py-4 flex items-center justify-center gap-2" 
          style={{ borderColor: 'hsl(var(--pixel-red))', color: 'hsl(var(--pixel-red))' }}
        >
          <KeyRound size={20} />
          Alterar Senha
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

      {/* Modal para alterar senha */}
      <PasswordChangeModal 
        open={openDialogs.passwordChange} 
        onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, passwordChange: open }))} 
      />
    </div>
  );
};