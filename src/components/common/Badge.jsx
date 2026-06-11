/**
 * Badge.jsx — Etiqueta colorida pequena
 *
 * Props:
 *  • color: 'brand' | 'green' | 'red' | 'yellow' | 'gray' | 'blue'
 *  • size:  'sm' | 'md'
 *  • dot:   exibe ponto colorido antes do texto
 */
const COLORS = {
  brand:  'bg-brand-100  dark:bg-brand-950/50 text-brand-700  dark:text-brand-300  border-brand-200  dark:border-brand-800',
  green:  'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  red:    'bg-rose-100   dark:bg-rose-950/40 text-rose-700   dark:text-rose-300   border-rose-200   dark:border-rose-800',
  yellow: 'bg-amber-100  dark:bg-amber-950/40 text-amber-700  dark:text-amber-300  border-amber-200  dark:border-amber-800',
  gray:   'bg-slate-100  dark:bg-slate-800 text-slate-600  dark:text-slate-300  border-slate-200  dark:border-slate-700',
  blue:   'bg-sky-100    dark:bg-sky-950/40 text-sky-700    dark:text-sky-300    border-sky-200    dark:border-sky-800',
};

const DOT_COLORS = {
  brand: 'bg-brand-500', green: 'bg-emerald-500', red: 'bg-rose-500',
  yellow: 'bg-amber-500', gray: 'bg-slate-500', blue: 'bg-sky-500',
};

export default function Badge({ children, color = 'brand', size = 'sm', dot = false, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 border font-medium rounded-full',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        COLORS[color] ?? COLORS.gray,
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[color] ?? 'bg-slate-500'}`} />
      )}
      {children}
    </span>
  );
}
