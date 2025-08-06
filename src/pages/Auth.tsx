import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { PixelButton } from '@/components/PixelButton';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect authenticated users to home
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Redirect if already authenticated
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Este email já está cadastrado. Tente fazer login.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="pixel-border p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl text-cyan-400 mb-2">
              {isLogin ? 'Login' : 'Criar Conta'}
            </h1>
            <p className="text-cyan-300">
              {isLogin ? 'Entre na sua conta de pai/mãe' : 'Crie sua conta de pai/mãe'}
            </p>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-cyan-400 text-lg mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pixel-border p-3 bg-transparent text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="seu@email.com"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-cyan-400 text-lg mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pixel-border p-3 bg-transparent text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full pixel-btn text-cyan-400 text-xl py-4"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-300 hover:text-cyan-100 transition-colors"
              disabled={loading}
            >
              {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Fazer login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;