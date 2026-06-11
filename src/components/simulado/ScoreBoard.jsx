/**
 * ScoreBoard.jsx — Painel lateral do simulado em andamento
 *
 * Exibe (sem revelar certo/errado — isso só aparece em Resultado):
 *  • Respondidas: quantas questões já foram respondidas
 *  • Pendentes:   quantas ainda faltam
 *  • Timer atual: tempo gasto na questão atual (crescente)
 *  • Barra de progresso preenchida conforme questões respondidas
 */
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { useSimulado } from '../../contexts/SimuladoContext';

function Contador({ icone: Icone, valor, label, colorClass, bgClass }) {
  return (
    <div className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl ${bgClass}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icone size={15} />
      </div>
      <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
        {valor}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
    </div>
  );
}

// Formata segundos para MM:SS ou Xs
function fmt(seg) {
  if (!seg) return '0s';
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s > 0 ? `${s}s` : ''}`.trim();
}

export default function ScoreBoard() {
  const { respondidas, total, tempoQuestaoAtual } = useSimulado();

  const pendentes  = total - respondidas;
  const pctFeito   = total > 0 ? Math.round((respondidas / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4">
      {/* Título */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          Progresso
        </h3>
        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
          {pctFeito}% respondido
        </span>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-2">
        <Contador
          icone={CheckSquare}
          valor={respondidas}
          label="Feitas"
          colorClass="bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400"
          bgClass="bg-brand-50 dark:bg-brand-950/20"
        />
        <Contador
          icone={AlertCircle}
          valor={pendentes}
          label="Restantes"
          colorClass="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          bgClass="bg-slate-50 dark:bg-slate-800/50"
        />
        <Contador
          icone={Clock}
          valor={fmt(tempoQuestaoAtual)}
          label="Nesta"
          colorClass="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
          bgClass="bg-amber-50 dark:bg-amber-950/20"
        />
      </div>

      {/* Barra de progresso */}
      {total > 0 && (
        <div className="mt-3 flex gap-0.5 h-2 rounded-full overflow-hidden">
          <div
            className="gradient-brand transition-all duration-500"
            style={{ width: `${(respondidas / total) * 100}%` }}
          />
          <div className="bg-slate-200 dark:bg-slate-700 flex-1" />
        </div>
      )}

      {/* Aviso: resultado só no final */}
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3 leading-tight">
        Acertos e erros revelados ao finalizar
      </p>
    </div>
  );
}
