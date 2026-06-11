/**
 * AuthContext.jsx — Contexto global de autenticação
 *
 * Fornece para toda a aplicação:
 *  • usuario: dados do usuário logado (ou null)
 *  • token: JWT atual
 *  • entrar(): faz login e persiste tokens
 *  • sair(): faz logout e limpa localStorage
 *  • carregando: true enquanto verifica sessão inicial
 *
 * Os tokens ficam no localStorage para persistir entre sessões.
 * O userId e dados básicos também ficam salvos para uso offline.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login, logout } from '../api/auth';

// Cria o contexto (valor inicial nulo)
const AuthContext = createContext(null);

/**
 * AuthProvider — envolve a aplicação e disponibiliza o contexto
 * Uso: <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  // Estado do usuário logado (null = não logado)
  const [usuario, setUsuario] = useState(null);
  // true durante a verificação inicial de sessão
  const [carregando, setCarregando] = useState(true);

  // ─── Carregamento inicial ─────────────────────────────────────────────
  // Ao montar o contexto, tenta restaurar a sessão do localStorage
  useEffect(() => {
    const token   = localStorage.getItem('tokenAcesso');
    const salvo   = localStorage.getItem('usuario');

    if (token && salvo) {
      try {
        setUsuario(JSON.parse(salvo));
      } catch {
        // JSON inválido → limpa tudo
        localStorage.clear();
      }
    }
    setCarregando(false);
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────
  /**
   * Autentica o usuário e salva os tokens
   * @param {string} email
   * @param {string} senha
   */
  const entrar = useCallback(async (email, senha) => {
    const resposta = await login(email, senha);

    // A API retorna { sucesso, dados: { tokenAcesso, refreshToken, usuario } }
    const dados = resposta.dados ?? resposta;

    // Persiste tokens no localStorage
    localStorage.setItem('tokenAcesso',  dados.tokenAcesso);
    localStorage.setItem('refreshToken', dados.refreshToken);
    localStorage.setItem('usuario',      JSON.stringify(dados.usuario));

    // Atualiza o estado
    setUsuario(dados.usuario);

    return dados;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────
  /**
   * Revoga o token no servidor e limpa a sessão local
   */
  const sair = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await logout(refreshToken); // ignora erros (token pode já ter expirado)

    localStorage.clear();
    setUsuario(null);
  }, []);

  // ─── Atualizar dados do usuário em memória ────────────────────────────
  // Útil quando o usuário edita o perfil: atualiza sem fazer novo login
  const atualizarUsuario = useCallback((novosDados) => {
    setUsuario((prev) => {
      const atualizado = { ...prev, ...novosDados };
      localStorage.setItem('usuario', JSON.stringify(atualizado));
      return atualizado;
    });
  }, []);

  // Valor exposto para todos os consumidores do contexto
  const valor = {
    usuario,
    carregando,
    estaLogado: !!usuario,
    entrar,
    sair,
    atualizarUsuario,
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — hook para consumir o AuthContext
 * Uso: const { usuario, entrar, sair } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
