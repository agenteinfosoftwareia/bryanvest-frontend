/**
 * Cadastro.jsx — Tela de registro de novo usuário
 *
 * Campos:
 *  • Nome completo
 *  • E-mail
 *  • Senha + Confirmação de senha
 *
 * Após cadastro bem-sucedido:
 *  → Faz login automático e redireciona para /dashboard
 *
 * API usada:
 *  • POST /api/v1/usuarios         — cria o usuário
 *  • POST /api/v1/autenticacao/entrar — login automático
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, GraduationCap } from 'lucide-react';
import { cadastrar } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input  from '../components/common/Input';

// Indicador visual de força de senha
function ForcaSenha({ senha }) {
  let forca = 0;
  let label = '';
  let color = '';

  if (senha.length >= 6)                          forca++;
  if (senha.length >= 8)                          forca++;
  if (/[A-Z]/.test(senha))                        forca++;
  if (/[0-9]/.test(senha))                        forca++;
  if (/[^A-Za-z0-9]/.test(senha))                 forca++;

  if (forca <= 1) { label = 'Fraca';  color = 'bg-rose-500'; }
  else if (forca <= 3) { label = 'Média'; color = 'bg-amber-400'; }
  else { label = 'Forte'; color = 'bg-emerald-500'; }

  if (!senha) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= forca ? color : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${forca <= 1 ? 'text-rose-500' : forca <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
        {label}
      </span>
    </div>
  );
}

export default function Cadastro() {
  const { entrar } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    nome: '', email: '', senha: '', confirmacaoSenha: '',
  });
  const [mostrarSenha, setMostrarSenha]     = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [carregando, setCarregando]         = useState(false);
  const [erros, setErros]                   = useState({});
  const [sucesso, setSucesso]               = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: null }));
  };

  const validar = () => {
    const e = {};
    if (!form.nome.trim())                e.nome = 'Informe seu nome';
    else if (form.nome.trim().length < 2) e.nome = 'Nome muito curto';

    if (!form.email)                         e.email = 'Informe seu e-mail';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido';

    if (!form.senha)                     e.senha = 'Crie uma senha';
    else if (form.senha.length < 6)      e.senha = 'Mínimo 6 caracteres';

    if (!form.confirmacaoSenha) e.confirmacaoSenha = 'Confirme sua senha';
    else if (form.confirmacaoSenha !== form.senha) e.confirmacaoSenha = 'As senhas não coincidem';

    return e;
  };

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
      // 1. Cadastra o usuário
      await cadastrar({
        nome:              form.nome.trim(),
        email:             form.email.trim(),
        senha:             form.senha,
        confirmacaoSenha:  form.confirmacaoSenha,
      });

      setSucesso(true);

      // 2. Login automático após cadastro
      await entrar(form.email.trim(), form.senha);

      // 3. Redireciona para o dashboard
      setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
    } catch (err) {
      const msg = err.response?.data?.mensagem
        ?? err.response?.data?.errors?.join(', ')
        ?? 'Erro ao criar conta. Tente novamente.';
      setErros({ geral: msg });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md animate-slideUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-brand-md glow-brand">
            <GraduationCap size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Criar conta
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Comece a se preparar para o ENEM hoje
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 shadow-xl">
          {/* Sucesso */}
          {sucesso && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 animate-scaleIn">
              <CheckCircle size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Conta criada com sucesso!
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Redirecionando para o dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Erro geral */}
          {erros.geral && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm animate-slideDown">
              ⚠️ {erros.geral}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Nome */}
            <Input
              label="Nome completo"
              name="nome"
              type="text"
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
              icon={<User size={16} />}
              error={erros.nome}
              autoComplete="name"
            />

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
            <div>
              <Input
                label="Senha"
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={handleChange}
                icon={<Lock size={16} />}
                error={erros.senha}
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    tabIndex={-1}
                    className="hover:text-brand-500 transition-colors"
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              {/* Indicador de força */}
              <ForcaSenha senha={form.senha} />
            </div>

            {/* Confirmar senha */}
            <Input
              label="Confirmar senha"
              name="confirmacaoSenha"
              type={mostrarConfirm ? 'text' : 'password'}
              placeholder="Repita a senha"
              value={form.confirmacaoSenha}
              onChange={handleChange}
              icon={<Lock size={16} />}
              error={erros.confirmacaoSenha}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setMostrarConfirm(!mostrarConfirm)}
                  tabIndex={-1}
                  className="hover:text-brand-500 transition-colors"
                >
                  {mostrarConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Botão */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={carregando}
              className="mt-2"
            >
              {carregando ? 'Criando conta...' : 'Criar conta grátis'}
            </Button>
          </form>

          {/* Link login */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-5">
            Já tem conta?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
