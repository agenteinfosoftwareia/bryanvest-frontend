/**
 * Timer.jsx — Cronômetro regressivo do simulado
 *
 * Exibe o tempo restante em MM:SS com feedback visual progressivo:
 *   > 50% restante  → verde  (calmo)
 *   10–50% restante → amarelo (atenção)
 *   < 10% restante  → vermelho + pulso animado (urgente)
 *   00:00           → vermelho sólido
 *
 * Props:
 *  • tempoRestante: segundos restantes (number)
 *  • tempoTotal:    segundos totais do simulado (para calcular %)
 *  • compact:       exibição reduzida (só MM:SS, sem label)
 */
import { Clock } from 'lucide-react';

export default function Timer({ tempoRestante, tempoTotal, compact = false }) {
  // Formata segundos para MM:SS
  const minutos  = Math.floor(tempoRestante / 60);
  const segundos = tempoRestante % 60;
  const display  = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  // Percentual restante para definir a cor
  const pct = tempoTotal > 0 ? tempoRestante / tempoTotal : 1;

  const { cor, bg, pulso } =
    pct <= 0
      ? { cor: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-100 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700',   pulso: false }
    : pct < 0.10
      ? { cor: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-100 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700',   pulso: true  }
    : pct < 0.50
      ? { cor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', pulso: false }
      : { cor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800', pulso: false };

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-bold text-sm ${bg} ${cor} ${pulso ? 'animate-pulse' : ''}`}>
        <Clock size={13} />
        {display}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${bg} ${pulso ? 'animate-pulse' : ''}`}>
      <Clock size={16} className={cor} />
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mb-0.5">Tempo restante</p>
        <p className={`font-mono font-black text-xl leading-none ${cor}`}>{display}</p>
      </div>
    </div>
  );
}
