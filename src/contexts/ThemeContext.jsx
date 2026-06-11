/**
 * ThemeContext.jsx — Contexto de tema (claro / escuro)
 *
 * Funcionalidades:
 *  • Lê preferência salva no localStorage
 *  • Aplica a classe 'dark' no <html> para ativar dark mode do Tailwind
 *  • Sincroniza com a preferência do sistema operacional se não houver salvo
 *  • Expõe: isDark, alternarTema()
 */
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Inicializa com a preferência salva, ou a preferência do sistema
  const [isDark, setIsDark] = useState(() => {
    const salvo = localStorage.getItem('modoEscuro');
    if (salvo !== null) return salvo === 'true';
    // Fallback: preferência do sistema operacional
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toda vez que isDark muda, aplica/remove a classe 'dark' no <html>
  // e persiste no localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('modoEscuro', String(isDark));
  }, [isDark]);

  // Alterna entre claro e escuro
  const alternarTema = () => setIsDark((prev) => !prev);

  // Força um modo específico (usado ao sincronizar com o perfil da API)
  const definirTema = (escuro) => setIsDark(!!escuro);

  return (
    <ThemeContext.Provider value={{ isDark, alternarTema, definirTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme — hook para consumir o ThemeContext
 * Uso: const { isDark, alternarTema } = useTheme();
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}
