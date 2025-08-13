import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const CriarPerfil = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="pixel-border p-8">
          <h1 className="text-4xl text-cyan-400 mb-6">
            Bem-vindo(a)!
          </h1>
          
          <p className="text-cyan-300 text-xl mb-8 leading-relaxed">
            Agora, você deve criar o Perfil da Criança. Vamos em frente?
          </p>
          
          <button
            onClick={() => navigate('/novoperfil')}
            className="pixel-btn text-cyan-400 text-xl py-4 px-8 w-full"
          >
            Criar Perfil da Criança
          </button>
        </div>
      </div>
    </div>
  );
};

export default CriarPerfil;