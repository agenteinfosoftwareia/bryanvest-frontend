/**
 * Card.jsx — Container com visual de cartão
 *
 * Props:
 *  • glass:    aplica efeito glassmorphism
 *  • hover:    escala levemente no hover
 *  • padding:  'none' | 'sm' | 'md' | 'lg'
 *  • className: classes extras
 */
export default function Card({
  children,
  glass   = false,
  hover   = false,
  padding = 'md',
  className = '',
  ...props
}) {
  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
  };

  return (
    <div
      className={[
        // Base
        'rounded-2xl border transition-all duration-200',
        // Tema claro/escuro
        glass
          ? 'glass'
          : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60',
        // Hover lift
        hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '',
        // Padding
        paddings[padding] ?? paddings.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
