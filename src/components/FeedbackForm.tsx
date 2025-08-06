import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Phone, MessageCircle } from "lucide-react";

interface FeedbackFormProps {
  onClose: () => void;
}

export const FeedbackForm = ({ onClose }: FeedbackFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!suggestion.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva sua sugestão antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado. Faça login para enviar sugestões.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('feedback_suggestions')
        .insert({
          name: name.trim() || null,
          email: email.trim() || null,
          suggestion: suggestion.trim(),
          user_id: user.id,
        });

      if (error) {
        console.error('Erro ao salvar feedback:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar sugestão: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sucesso!",
        description: "Sua sugestão foi enviada com sucesso. Obrigado pelo feedback!",
      });
      
      // Limpar formulário
      setName("");
      setEmail("");
      setSuggestion("");
      onClose();
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar sugestão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="pixel-border bg-background">
        <CardHeader>
          <CardTitle className="text-center text-pixel-cyan">
            <MessageCircle className="inline-block mr-2" size={24} />
            Suas sugestões são importantes!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome (opcional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="pixel-border"
              />
            </div>

            <div>
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pixel-border"
              />
            </div>

            <div>
              <Label htmlFor="suggestion">Sua sugestão *</Label>
              <Textarea
                id="suggestion"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Como podemos melhorar o aplicativo? Suas ideias são muito bem-vindas!"
                className="pixel-border min-h-[120px]"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="pixel-btn flex-1"
                style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
              >
                {isSubmitting ? "Enviando..." : "Enviar Sugestão"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="pixel-btn"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="pixel-border bg-background">
        <CardHeader>
          <CardTitle className="text-center text-pixel-cyan">
            <Phone className="inline-block mr-2" size={24} />
            Contato Direto
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-2">
            Prefere falar diretamente? Entre em contato:
          </p>
          <div className="pixel-border p-4 bg-card/50">
            <p className="text-lg font-bold text-pixel-green">
              📱 +55 47 9 9648 1616
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              WhatsApp disponível
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};