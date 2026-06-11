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
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input  from '../components/common/Input';

export default function Login() {
  const { entrar } = useAuth();
  const navigate   = useNavigate();

  // Estado do formulário
  const [form, setForm] = useState({ email: '', senha: '' });
  // Controla visibilidade da senha
  const [mostrarSenha, setMostrarSenha] = useState(false);
  // Loading durante a chamada à API
  const [carregando, setCarregando] = useState(false);
  // Erros de validação/API
  const [erros, setErros] = useState({});

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
