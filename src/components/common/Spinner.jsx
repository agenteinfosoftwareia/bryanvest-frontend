/**
 * Spinner.jsx — Indicador de carregamento circular
 *
 * Props:
 *  • size: 'sm' | 'md' | 'lg' | 'xl'
 *  • color: 'brand' | 'white' | 'current' (herda a cor do elemento pai)
 */

const SIZES = {
  sm:  'w-4 h-4 border-2',
  md:  'w-6 h-6 border-2',
  lg:  'w-8 h-8 border-3',
  xl:  'w-12 h-12 border-4',
};

const COLORS = {
  brand:   'border-brand-500/30 border-t-brand-500',
  white:   'border-white/30 border-t-white',
  current: 'border-current/30 border-t-current',
  gray:    'border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300',
};

export default function Spinner({ size = 'md', color = 'brand', className = '' }) {
  return (
    <div
      role="status"
      aria-label="Carregando..."
      className={[
        'rounded-full animate-spin shrink-0',
        SIZES[size]  ?? SIZES.md,
        COLORS[color] ?? COLORS.brand,
        className,
      ].join(' ')}
    />
  );
}
