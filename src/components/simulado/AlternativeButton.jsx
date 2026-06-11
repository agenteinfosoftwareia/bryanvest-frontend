/**
 * AlternativeButton.jsx — Botão de alternativa da questão
 *
 * Estado visual:
 *  • Normal: branco/cinza, hover levemente destacado
 *  • Selecionado (antes de revelar): borda brand azul/roxo
 *  • Correto (após revelar): borda e fundo verde
 *  • Errado (após revelar): borda e fundo vermelho
 *  • Correto não selecionado (após revelar): borda verde pontilhada
 *
 * Props:
 *  • letra:      'A' | 'B' | 'C' | 'D' | 'E' (exibido como badge)
 *  • texto:      conteúdo da alternativa
 *  • selecionada: o aluno clicou nesta
 *  • correta:    esta é a resposta certa
 *  • revelada:   o aluno já respondeu (mostra cores certas/erradas)
 *  • disabled:   desabilita clique
 *  • onClick
 */
import { Check, X } from 'lucide-react';

export default function AlternativeButton({
  letra,
  texto,
  selecionada = false,
  correta     = false,
  revelada    = false,
  disabled    = false,
  onClick,
}) {
  // ── Determina o estado visual ──────────────────────────────────────────
  let estado = 'normal';
  if (revelada) {
    if (selecionada && correta)  estado = 'acerto';      // acertou
    if (selecionada && !correta) estado = 'erro';         // errou
    if (!selecionada && correta) estado = 'corretaNaoSelecionada'; // era a certa
  } else if (selecionada) {
    estado = 'selecionada'; // ainda não revelou
  }

  // ── Classes da bolinha da letra ────────────────────────────────────────
  const letraClasses = {
    normal:               'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    selecionada:          'gradient-brand text-white',
    acerto:               'bg-emerald-500 text-white',
    erro:                 'bg-rose-500 text-white',
    corretaNaoSelecionada:'bg-emerald-500 text-white',
  }[estado];

  // ── Ícone do lado direito ──────────────────────────────────────────────
  const icone = {
    acerto:               <Check size={16} className="text-emerald-600 dark:text-emerald-400" />,
    erro:                 <X    size={16} className="text-rose-500" />,
    corretaNaoSelecionada:<Check size={16} className="text-emerald-600 dark:text-emerald-400" />,
  }[estado];

  return (
    <button
      className={[
        'alt-btn',
        estado === 'selecionada'          ? 'selected' : '',
        estado === 'acerto'               ? 'correct'  : '',
        estado === 'erro'                 ? 'wrong'    : '',
        estado === 'corretaNaoSelecionada'? 'correct border-dashed' : '',
      ].join(' ')}
      onClick={onClick}
      disabled={disabled || revelada}
      type="button"
    >
      {/* Badge da letra (A, B, C...) */}
      <span
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${letraClasses}`}
      >
        {letra.toUpperCase()}
      </span>

      {/* Texto da alternativa */}
      <span className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {texto}
      </span>

      {/* Ícone de certo/errado */}
      {icone && (
        <span className="shrink-0 animate-scaleIn">
          {icone}
        </span>
      )}
    </button>
  );
}
