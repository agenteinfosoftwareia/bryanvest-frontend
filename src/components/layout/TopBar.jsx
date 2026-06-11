/**
 * TopBar.jsx — Barra superior
 *
 * Exibe:
 *  • Botão hamburger (mobile) para abrir a sidebar
 *  • Título da página atual
 *  • Botão de toggle dark/light mode
 *  • Avatar do usuário
 */
import { Sun, Moon, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Mapeamento de rota → título exibido na topbar
const TITULOS = {
  '/dashboard': 'Dashboard',
  '/simulados': 'Escolher Simulado',
  '/simulado':  'Simulado em andamento',
  '/resultado': 'Resultado',
  '/perfil':    'Meu Perfil',
};

export default function TopBar({ onMenuClick }) {
  const { isDark, alternarTema } = useTheme();
  const { usuario } = useAuth();
  const { pathname } = useLocation();

  // Resolve o título baseado na rota atual
  const titulo = TITULOS[pathname] ?? TITULOS[Object.keys(TITULOS).find((k) => pathname.startsWith(k))] ?? 'BryanVest';

  // Iniciais do usuário para avatar
  const iniciais = usuario?.nome
    ? usuario.nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <header className="h-16 px-4 lg:px-6 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      {/* Hamburger (apenas mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={20} className="text-slate-600 dark:text-slate-400" />
      </button>

      {/* Título da página */}
      <div className="flex-1">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
          {titulo}
        </h2>
      </div>

      {/* Toggle dark/light mode */}
      <button
        onClick={alternarTema}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        title={isDark ? 'Tema claro' : 'Tema escuro'}
      >
        {isDark ? (
          <Sun size={18} className="text-amber-400" />
        ) : (
          <Moon size={18} className="text-slate-600" />
        )}
      </button>

      {/* Avatar do usuário */}
      <div
        className="w-9 h-9 gradient-brand rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer"
        title={usuario?.nome ?? 'Perfil'}
      >
        {iniciais}
      </div>
    </header>
  );
}
