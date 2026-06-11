/**
 * ProtectedRoute.jsx — Guarda de rota autenticada
 *
 * Redireciona para /login se o usuário não estiver autenticado.
 * Exibe um spinner de carregamento enquanto verifica a sessão inicial.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../common/Spinner';

export default function ProtectedRoute({ children }) {
  const { estaLogado, carregando } = useAuth();

  // Ainda verificando sessão no localStorage → mostra tela de loading
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="xl" color="brand" />
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
            Verificando sessão...
          </p>
        </div>
      </div>
    );
  }

  // Não logado → redireciona para login
  if (!estaLogado) {
    return <Navigate to="/login" replace />;
  }

  // Logado → renderiza o conteúdo protegido
  return children;
}
