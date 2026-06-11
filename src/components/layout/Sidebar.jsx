/**
 * Sidebar.jsx — Menu lateral de navegação
 *
 * Exibe:
 *  • Logo + nome do app
 *  • Links de navegação com ícones
 *  • Perfil do usuário no rodapé
 *  • Botão de logout
 *
 * Em telas menores (mobile) a sidebar fica oculta e é aberta via TopBar.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, User, LogOut, GraduationCap,
  Trophy, ChevronRight, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Itens de navegação principal
const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',   desc: 'Visão geral' },
  { to: '/simulados',  icon: BookOpen,         label: 'Simulados',   desc: 'Iniciar prova' },
  { to: '/resultado',  icon: Trophy,           label: 'Resultados',  desc: 'Histórico' },
  { to: '/perfil',     icon: User,             label: 'Perfil',      desc: 'Minha conta' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  // Faz logout e redireciona para login
  const handleLogout = async () => {
    await sair();
    navigate('/login');
  };

  // Iniciais do usuário para avatar
  const iniciais = usuario?.nome
    ? usuario.nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <>
      {/* Overlay escuro para mobile quando sidebar aberta */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          // Layout
          'fixed top-0 left-0 h-full w-64 z-50 flex flex-col',
          // Transição mobile
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Tema
          'bg-white dark:bg-slate-900',
          'border-r border-slate-200 dark:border-slate-800',
        ].join(' ')}
      >
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* Ícone do app */}
            <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-brand-sm">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                BryanVest
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plataforma ENEM
              </p>
            </div>
          </div>
        </div>

        {/* ── Nav principal ───────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Seção: Menu */}
          <p className="px-3 pb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Menu
          </p>

          {NAV_ITEMS.map(({ to, icon: Icon, label, desc }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                isActive
                  ? 'nav-active font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
              ].join(' ')}
            >
              {/* Ícone */}
              <Icon size={18} className="shrink-0" />

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-none">{label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  {desc}
                </p>
              </div>

              {/* Seta direita no hover */}
              <ChevronRight
                size={14}
                className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-slate-400"
              />
            </NavLink>
          ))}

          {/* Destaque: Novo Simulado */}
          <div className="pt-4">
            <NavLink
              to="/simulados"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm shadow-brand-sm hover:shadow-brand-md transition-all duration-200 hover:scale-[1.02]"
            >
              <Sparkles size={16} />
              Novo Simulado
            </NavLink>
          </div>
        </nav>

        {/* ── Perfil + Logout ──────────────────────────────────────────── */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          {/* Info do usuário */}
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            {/* Avatar com iniciais */}
            <div className="w-9 h-9 gradient-brand rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
              {iniciais}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {usuario?.nome ?? 'Usuário'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {usuario?.email ?? ''}
              </p>
            </div>
          </div>

          {/* Botão Sair */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}
