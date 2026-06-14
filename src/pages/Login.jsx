/**
 * Login.jsx — Tela de autenticação
 *
 * Funcionalidades:
 *  • Formulário com e-mail e senha
 *  • Validação básica no frontend antes de chamar a API
 *  • Toggle para mostrar/ocultar senha
 *  • Exibe mensagem de erro da API (e-mail ou senha incorretos)
 *  • Link para a tela de Cadastro
 *  • Redireciona para /dashboard após login bem-sucedido
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Sparkles } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input  from '../components/common/Input';

export default function Login() {
  const { entrar, entrarComGoogle } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({ email: '', senha: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const [erros, setErros] = useState({});

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setCarregandoGoogle(true);
      setErros({});
      try {
        await entrarComGoogle(tokenResponse.access_token);
        navigate('/dashboard', { replace: true });
      } catch {
        setErros({ geral: 'Não foi possível autenticar com o Google. Tente novamente.' });
      } finally {
        setCarregandoGoogle(false);
      }
    },
    onError: () => setErros({ geral: 'Login com Google cancelado ou falhou.' }),
  });

  // Atualiza um campo do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpa o erro do campo ao digitar
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: null }));
  };

  // Validação básica antes de enviar
  const validar = () => {
    const novosErros = {};
    if (!form.email) novosErros.email = 'Informe seu e-mail';
    else if (!/\S+@\S+\.\S+/.test(form.email)) novosErros.email = 'E-mail inválido';
    if (!form.senha) novosErros.senha = 'Informe sua senha';
    else if (form.senha.length < 6) novosErros.senha = 'Senha deve ter ao menos 6 caracteres';
    return novosErros;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errosValidacao = validar();
    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao);
      return;
    }

    setCarregando(true);
    setErros({});

    try {
      await entrar(form.email, form.senha);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Extrai mensagem de erro da API
      const msg = err.response?.data?.mensagem
        ?? err.response?.data?.message
        ?? 'E-mail ou senha incorretos';
      setErros({ geral: msg });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* ── Painel esquerdo: visual decorativo ──────────────────────── */}
      <div className="hidden lg:flex w-1/2 gradient-brand items-center justify-center relative overflow-hidden">
        {/* Círculos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-white/5 rounded-full animate-pulse-slow" />
        </div>

        <div className="relative text-center text-white px-12">
          {/* Logo */}
          <div className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black mb-3">BryanVest</h1>
          <p className="text-xl text-white/80 mb-8 font-light">
            Sua plataforma de estudos para o ENEM
          </p>

          {/* Cards de funcionalidades */}
          <div className="space-y-3 text-left">
            {[
              { emoji: '📚', text: '4.260+ questões ENEM 2009–2024' },
              { emoji: '🎯', text: 'Simulados por área, disciplina e nível' },
              { emoji: '📊', text: 'Dashboard com gráficos de desempenho' },
              { emoji: '🌙', text: 'Modo escuro para estudar à noite' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3"
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel direito: formulário ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-slideUp">
          {/* Cabeçalho */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-brand-md">
              <GraduationCap size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-black gradient-brand-text">BryanVest</h1>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Bem-vindo de volta!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Faça login para continuar seus estudos
          </p>

          {/* Erro geral */}
          {erros.geral && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2 animate-slideDown">
              <span>⚠️</span> {erros.geral}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* E-mail */}
            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              icon={<Mail size={16} />}
              error={erros.email}
              autoComplete="email"
            />

            {/* Senha */}
            <Input
              label="Senha"
              name="senha"
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.senha}
              onChange={handleChange}
              icon={<Lock size={16} />}
              error={erros.senha}
              autoComplete="current-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="p-0.5 hover:text-brand-500 transition-colors"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Botão de login */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={carregando}
              icon={!carregando && <Sparkles size={16} />}
              className="mt-6"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 dark:text-slate-500">ou</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Botão Google */}
          <button
            type="button"
            onClick={() => handleGoogle()}
            disabled={carregandoGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-6"
          >
            {carregandoGoogle ? (
              <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            )}
            {carregandoGoogle ? 'Autenticando...' : 'Continuar com Google'}
          </button>

          {/* Link para cadastro */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Ainda não tem conta?{' '}
            <Link
              to="/cadastro"
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
