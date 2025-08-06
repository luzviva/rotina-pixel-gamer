import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PinChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PinChangeModal = ({ open, onOpenChange }: PinChangeModalProps) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const enterDigit = (digit: string) => {
    if (step === 'current' && currentPin.length < 4) {
      setCurrentPin(prev => prev + digit);
      setError('');
    } else if (step === 'new' && newPin.length < 4) {
      setNewPin(prev => prev + digit);
      setError('');
    } else if (step === 'confirm' && confirmPin.length < 4) {
      setConfirmPin(prev => prev + digit);
      setError('');
    }
  };

  const clearPin = () => {
    if (step === 'current') setCurrentPin('');
    else if (step === 'new') setNewPin('');
    else if (step === 'confirm') setConfirmPin('');
    setError('');
  };

  const resetModal = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setStep('current');
    setError('');
  };

  const handleNext = async () => {
    if (step === 'current') {
      // Verificar PIN atual
      if (currentPin === '9999') {
        // Verificar se o usuário já tem um PIN personalizado
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('parent_pin')
            .eq('user_id', user.id)
            .single();

          if (profile?.parent_pin && profile.parent_pin !== currentPin) {
            setError('PIN atual incorreto!');
            setCurrentPin('');
            return;
          }
        }
        setStep('new');
      } else {
        // Verificar se é o PIN personalizado do usuário
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('parent_pin')
            .eq('user_id', user.id)
            .single();

          if (profile?.parent_pin === currentPin) {
            setStep('new');
          } else {
            setError('PIN atual incorreto!');
            setCurrentPin('');
          }
        }
      }
    } else if (step === 'new') {
      if (newPin === '9999') {
        setError('Não é possível usar o PIN padrão!');
        setNewPin('');
        return;
      }
      if (newPin.length === 4) {
        setStep('confirm');
      }
    } else if (step === 'confirm') {
      if (newPin === confirmPin) {
        await saveNewPin();
      } else {
        setError('PINs não coincidem!');
        setConfirmPin('');
      }
    }
  };

  const saveNewPin = async () => {
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

      const { error } = await supabase
        .from('profiles')
        .update({ parent_pin: newPin })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "PIN alterado com sucesso! O PIN padrão '9999' foi desabilitado.",
      });

      resetModal();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao alterar PIN:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar PIN",
        variant: "destructive",
      });
    }
  };

  const getCurrentPinDisplay = () => {
    if (step === 'current') return currentPin;
    if (step === 'new') return newPin;
    return confirmPin;
  };

  const getTitle = () => {
    if (step === 'current') return 'Digite o PIN atual';
    if (step === 'new') return 'Digite o novo PIN';
    return 'Confirme o novo PIN';
  };

  const getCurrentPinLength = () => {
    if (step === 'current') return currentPin.length;
    if (step === 'new') return newPin.length;
    return confirmPin.length;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 p-4">
          <div className="h-16 w-full bg-black/50 border-4 border-cyan-400 flex items-center justify-center text-4xl tracking-[1rem]">
            <span>{'*'.repeat(getCurrentPinLength())}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                onClick={() => enterDigit(digit)}
                className="pixel-btn aspect-square text-2xl"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={clearPin}
              className="pixel-btn aspect-square text-yellow-400 border-yellow-400 text-2xl"
              style={{ borderColor: 'hsl(var(--pixel-yellow))', color: 'hsl(var(--pixel-yellow))' }}
            >
              C
            </button>
            <button
              onClick={() => enterDigit('0')}
              className="pixel-btn aspect-square text-2xl"
            >
              0
            </button>
            <button
              onClick={handleNext}
              className="pixel-btn aspect-square text-green-400 border-green-400 text-xl"
              style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
              disabled={getCurrentPinLength() < 4}
            >
              OK
            </button>
          </div>
          
          {error && (
            <p className="text-red-500 text-center h-6">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};