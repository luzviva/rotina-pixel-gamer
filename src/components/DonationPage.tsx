import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Heart, Gift } from "lucide-react";

interface DonationPageProps {
  onClose: () => void;
}

export const DonationPage = ({ onClose }: DonationPageProps) => {
  const { toast } = useToast();
  const pixKey = "09716668902";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      toast({
        title: "Copiado!",
        description: "CPF copiado para a área de transferência",
      });
    } catch (error) {
      // Fallback para browsers que não suportam clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = pixKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      
      toast({
        title: "Copiado!",
        description: "CPF copiado para a área de transferência",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <Card className="pixel-border bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-pixel-pink flex flex-col sm:flex-row items-center justify-center gap-2 text-xl sm:text-2xl">
            <Heart className="text-red-500" size={24} />
            Faça uma doação!
            <Heart className="text-red-500" size={24} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <p className="text-base sm:text-lg leading-relaxed px-2">
              Obrigado por considerar apoiar este projeto! Ele foi feito com muito carinho, 
              e todo apoio é bem vindo.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Gift className="text-pixel-cyan" size={20} />
              <span className="text-lg sm:text-xl font-semibold text-pixel-cyan text-center">
                Para doar, use a chave Pix abaixo:
              </span>
            </div>
          </div>

          <Card className="pixel-border bg-background/80 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <div className="text-center space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  CHAVE PIX - CPF
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-card rounded-lg border-2 border-dashed border-pixel-green">
                  <span className="text-lg sm:text-2xl font-mono font-bold text-pixel-green break-all sm:break-normal">
                    {pixKey}
                  </span>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    className="pixel-btn w-full sm:w-auto"
                    style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
                  >
                    <Copy size={16} className="mr-1" />
                    Copiar
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground px-2">
                  Clique no botão acima para copiar o CPF
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl sm:text-6xl">🙏</span>
            </div>
            <p className="text-base sm:text-lg font-medium text-pixel-pink">
              Muito obrigado pelo seu apoio!
            </p>
            <p className="text-sm text-muted-foreground px-2">
              Cada contribuição ajuda a manter este projeto ativo e em constante evolução.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="pixel-btn w-full sm:w-32"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};