/**
 * Toggle.jsx — Switch de liga/desliga
 *
 * Props:
 *  • checked:  estado atual (boolean)
 *  • onChange: callback quando muda
 *  • label:    texto ao lado do toggle
 *  • disabled
 */
export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {/* Track (trilha do toggle) */}
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={[
          'relative w-12 h-6 rounded-full transition-all duration-300',
          checked
            ? 'gradient-brand shadow-brand-sm'
            : 'bg-slate-200 dark:bg-slate-700',
        ].join(' ')}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && onChange(!checked)}
      >
        {/* Bolinha (thumb) */}
        <span
          className={[
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md',
            'transition-all duration-300',
            checked ? 'left-6' : 'left-0.5',
          ].join(' ')}
        />
      </div>

      {/* Label */}
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
      )}
    </label>
  );
}
