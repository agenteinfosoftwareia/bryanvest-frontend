/**
 * Input.jsx — Campo de entrada reutilizável
 *
 * Props:
 *  • label:    texto acima do campo
 *  • error:    mensagem de erro (exibe em vermelho abaixo)
 *  • icon:     ícone à esquerda (elemento React)
 *  • rightIcon: ícone à direita (ex: botão de mostrar senha)
 *  • hint:     texto de ajuda abaixo do campo
 *  • ...resto: qualquer prop nativa de <input>
 */
export default function Input({
  label,
  error,
  icon,
  rightIcon,
  hint,
  className = '',
  id,
  ...props
}) {
  // Gera um id único se não fornecido (para acessibilidade do label)
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      {/* Wrapper com possível ícone */}
      <div className="relative">
        {/* Ícone esquerdo */}
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}

        {/* Campo de entrada com classe customizada do CSS global */}
        <input
          id={inputId}
          className={[
            'input-custom',
            icon       ? 'pl-11' : '',
            rightIcon  ? 'pr-11' : '',
            error      ? '!border-rose-500 focus:!ring-rose-500/20' : '',
          ].join(' ')}
          {...props}
        />

        {/* Ícone direito */}
        {rightIcon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {rightIcon}
          </span>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1 animate-fadeIn">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Dica */}
      {hint && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}
