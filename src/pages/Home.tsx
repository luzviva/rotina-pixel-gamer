import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PinScreen } from "@/components/PinScreen";
import { ParentDashboard } from "@/components/ParentDashboard";
import { ChildTasksScreen } from "@/components/ChildTasksScreen";
import { ChildStoreScreen } from "@/components/ChildStoreScreen";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState("pin");
  const [userType, setUserType] = useState<"parent" | "child" | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && userType === null) {
      checkChildren();
    }
  }, [user, userType]);

  const checkChildren = async () => {
    if (!user) return;
    
    setLoadingChildren(true);
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id);
    
    setLoadingChildren(false);
    
    if (!error && data) {
      setChildren(data);
      if (data.length === 0) {
        // Se não tem filhos, redireciona para criar primeiro filho
        navigate('/novoperfil');
        return;
      }
      // Se tem filhos, mantém na tela de PIN para escolher acesso
      // A tela inicial sempre será a visão da criança após o PIN
    }
  };

  const handlePinSuccess = (type: "parent" | "child") => {
    setUserType(type);
    if (type === "parent") {
      setCurrentScreen("parent-dashboard");
    } else {
      setCurrentScreen("child-tasks");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentScreen("pin");
    setUserType(null);
  };

  const handleStoreAccess = () => {
    setCurrentScreen("child-store");
  };

  const handleBackToTasks = () => {
    setCurrentScreen("child-tasks");
  };

  if (loading || loadingChildren) {
    return (
      <div className="min-h-screen bg-pixel-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="pixel-border p-8">
            <h2 className="text-2xl text-cyan-400 mb-4">Carregando...</h2>
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pixel-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="pixel-border p-8">
            <h2 className="text-2xl text-cyan-400 mb-4">Acesso não autorizado</h2>
            <Button 
              onClick={() => navigate('/auth')}
              className="pixel-btn text-cyan-400"
              style={{ borderColor: 'hsl(var(--pixel-cyan))', color: 'hsl(var(--pixel-cyan))' }}
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pixel-dark text-white">
      {currentScreen === "pin" && (
        <PinScreen onPinSuccess={handlePinSuccess} />
      )}
      
      {currentScreen === "parent-dashboard" && (
        <ParentDashboard onLogout={handleLogout} />
      )}
      
      {currentScreen === "child-tasks" && (
        <ChildTasksScreen 
          coinBalance={0} 
          onNavigate={setCurrentScreen} 
          onLogout={handleLogout} 
        />
      )}
      
      {currentScreen === "child-store" && (
        <ChildStoreScreen 
          coinBalance={0} 
          onNavigate={setCurrentScreen} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default Home;