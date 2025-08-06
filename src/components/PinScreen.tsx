import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PinScreenProps {
  onPinSuccess: (userType: 'child' | 'parent') => void;
}

export const PinScreen = ({ onPinSuccess }: PinScreenProps) => {
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<{ parent_pin: string | null } | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('parent_pin')
          .eq('user_id', user.id)
          .single();
        
        setUserProfile(profile);
      }
    };

    loadUserProfile();
  }, []);

  const enterPin = (digit: string) => {
    if (currentPin.length < 4) {
      setCurrentPin(prev => prev + digit);
      setError('');
    }
  };

  const clearPin = () => {
    setCurrentPin('');
    setError('');
  };

  const checkPin = () => {
    // PIN para criança: 1234
    if (currentPin === '1234') {
      onPinSuccess('child');
      clearPin();
      return;
    }

    // PIN para pais: verificar PIN personalizado ou padrão '9999'
    if (userProfile?.parent_pin) {
      // Se o usuário tem PIN personalizado, só aceitar o PIN personalizado
      if (currentPin === userProfile.parent_pin) {
        onPinSuccess('parent');
        clearPin();
      } else {
        setError('PIN incorreto!');
        clearPin();
      }
    } else {
      // Se não tem PIN personalizado, aceitar apenas '9999'
      if (currentPin === '9999') {
        onPinSuccess('parent');
        clearPin();
      } else {
        setError('PIN incorreto!');
        clearPin();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="pixel-border p-8 text-center w-full max-w-sm">
        <h1 className="text-4xl md:text-5xl text-yellow-400 mb-4">MISSÃO CONTROLE</h1>
        <p className="text-xl mb-6">Digite o PIN para acessar</p>
        <div className="h-16 w-full bg-black/50 border-4 border-cyan-400 mb-6 flex items-center justify-center text-4xl tracking-[1rem]">
          <span>{'*'.repeat(currentPin.length)}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
            <button key={digit} onClick={() => enterPin(digit)} className="pixel-btn">
              {digit}
            </button>
          ))}
          <button onClick={clearPin} className="pixel-btn text-yellow-400 border-yellow-400" style={{ borderColor: 'hsl(var(--pixel-yellow))', color: 'hsl(var(--pixel-yellow))' }}>
            C
          </button>
          <button onClick={() => enterPin('0')} className="pixel-btn">0</button>
          <button onClick={checkPin} className="pixel-btn text-green-400 border-green-400" style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}>
            OK
          </button>
        </div>
        <p className="text-red-500 h-6">{error}</p>
      </div>
    </div>
  );
};