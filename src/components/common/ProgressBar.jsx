/**
 * ProgressBar.jsx — Barra de progresso animada
 *
 * Props:
 *  • value:    0 a 100 (percentual)
 *  • color:    'brand' | 'green' | 'red' | 'yellow'
 *  • size:     'sm' | 'md' | 'lg'
 *  • showLabel: exibe o percentual em texto
 *  • animated: adiciona efeito de brilho na barra
 */
const COLORS = {
  brand:  'gradient-brand',
  green:  'gradient-success',
  red:    'gradient-danger',
  yellow: 'gradient-warning',
};

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export default function ProgressBar({
  value = 0,
  color = 'brand',
  size  = 'md',
  showLabel = false,
  animated  = true,
  className = '',
}) {
  // Garante que o valor fique entre 0 e 100
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Trilha da barra */}
      <div
        className={`flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ${HEIGHTS[size] ?? HEIGHTS.md}`}
      >
        {/* Preenchimento */}
        <div
          className={[
            'h-full rounded-full transition-all duration-700 ease-out',
            COLORS[color] ?? COLORS.brand,
            // Efeito de shimmer animado
            animated ? 'relative overflow-hidden after:absolute after:inset-0 after:bg-white/20 after:animate-[shimmer_2s_infinite]' : '',
          ].join(' ')}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Label numérico */}
      {showLabel && (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-10 text-right">
          {pct}%
        </span>
      )}
    </div>
  );
}
