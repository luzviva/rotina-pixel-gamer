import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao Rotina Pixel Gamer!"
      });
      navigate('/');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Usuário já existe",
          description: "Este email já está cadastrado. Tente fazer login.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta."
      });
    }
  };

  return (
    <div className="min-h-screen bg-pixel-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Rotina Pixel Gamer</h1>
          <p className="text-gray-400">Sistema de gamificação para crianças</p>
        </div>

        <Card className="pixel-border bg-pixel-dark border-pixel-green">
          <CardHeader>
            <CardTitle className="text-center text-cyan-400">Acesso para Pais</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Entre ou cadastre-se para gerenciar as tarefas das crianças
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-pixel-dark border-pixel-green text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-300">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-pixel-dark border-pixel-green text-white"
                  />
                </div>
              </div>

              <TabsContent value="login" className="mt-6">
                <Button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full pixel-btn text-cyan-400"
                  style={{ borderColor: 'hsl(var(--pixel-cyan))', color: 'hsl(var(--pixel-cyan))' }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <Button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full pixel-btn text-green-400"
                  style={{ borderColor: 'hsl(var(--pixel-green))', color: 'hsl(var(--pixel-green))' }}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Ao se cadastrar, você será automaticamente um usuário "Parent" e poderá criar perfis para as crianças.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}