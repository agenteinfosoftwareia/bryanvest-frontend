/**
 * Button.jsx — Botão reutilizável
 *
 * Props:
 *  • variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
 *  • size:    'sm' | 'md' | 'lg'
 *  • loading: exibe spinner e desabilita o botão
 *  • icon:    elemento React exibido à esquerda do texto
 *  • fullWidth: ocupa toda a largura disponível
 *  • ...resto: qualquer prop nativa de <button>
 */
import Spinner from './Spinner';

// Mapa de classes por variante de estilo
const VARIANTS = {
  primary:   'gradient-brand text-white shadow-lg hover:shadow-brand-md hover:scale-[1.02] active:scale-[0.98]',
  secondary: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600',
  ghost:     'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
  danger:    'bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-rose-500/40',
  success:   'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-emerald-500/40',
  outline:   'border-2 border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30',
};

// Mapa de classes por tamanho
const SIZES = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size    = 'md',
  loading = false,
  icon    = null,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        // Base: flex, transição, fonte
        'inline-flex items-center justify-center font-semibold transition-all duration-200 select-none',
        // Variante e tamanho
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size]       ?? SIZES.md,
        // Largura
        fullWidth ? 'w-full' : '',
        // Desabilitado
        isDisabled ? 'opacity-60 cursor-not-allowed !scale-100 !shadow-none' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {/* Spinner de loading ou ícone */}
      {loading ? (
        <Spinner size="sm" color="current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      {/* Texto do botão */}
      {children}
    </button>
  );
}
