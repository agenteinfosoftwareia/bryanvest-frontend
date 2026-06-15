/**
 * SimuladoAtivo.jsx — Tela do simulado em andamento
 *
 * Exibe:
 *  • Timer total regressivo (se configurado) e tempo por questão
 *  • Barra de progresso superior com número da questão
 *  • Mini mapa de questões (respondida vs pendente — sem revelar certo/errado)
 *  • QuestionCard com a questão atual e alternativas embaralhadas
 *  • ScoreBoard lateral com respondidas e pendentes
 *  • Ao finalizar: redireciona para /resultado
 *
 * Proteção: se não há simulado ativo, redireciona para /simulados
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Clock } from 'lucide-react';
import { useSimulado } from '../contexts/SimuladoContext';
import QuestionCard from '../components/simulado/QuestionCard';
import ScoreBoard   from '../components/simulado/ScoreBoard';
import Timer        from '../components/simulado/Timer';
import ProgressBar  from '../components/common/ProgressBar';
import Button       from '../components/common/Button';

// Formata segundos para exibição compacta (ex: 1m 23s)
function formatarTempo(seg) {
  if (!seg) return '0s';
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s > 0 ? `${s}s` : ''}`.trim();
}

export default function SimuladoAtivo() {
  const {
    questoes, questaoAtual, indiceAtual, respostas,
    total, progresso, finalizado,
    tempoTotal, tempoRestante, timerAtivo,
    tempoQuestaoAtual,
    responder, avancar, retroceder, resetar,
  } = useSimulado();

  const navigate = useNavigate();

  // Sem simulado ativo → volta para escolha
  useEffect(() => {
    if (!questoes.length) {
      navigate('/simulados', { replace: true });
    }
  }, [questoes.length, navigate]);

  // Quando finalizado → vai para resultado
  useEffect(() => {
    if (finalizado) {
      navigate('/resultado');
    }
  }, [finalizado, navigate]);

  if (!questaoAtual) return null;

  // Resposta já dada para a questão atual
  const respostaAtual = respostas[questaoAtual.id];

  // Handler para abandonar o simulado
  const handleAbandonar = () => {
    if (window.confirm('Tem certeza que quer abandonar o simulado? Seu progresso será perdido.')) {
      resetar();
      navigate('/simulados');
    }
  };

  return (
    <div className="animate-fadeIn w-full">
      {/* ── Barra de progresso + info topo ─────────────────────────── */}
      <div className="mb-5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          {/* Questão + tempo por questão */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Questão {indiceAtual + 1} de {total}
            </span>
            {/* Cronômetro da questão atual (tempo crescente) */}
            <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
              <Clock size={11} />
              {formatarTempo(tempoQuestaoAtual)}
            </span>
          </div>

          {/* Timer total regressivo + botão abandonar */}
          <div className="flex items-center gap-3">
            {timerAtivo && (
              <Timer tempoRestante={tempoRestante} tempoTotal={tempoTotal} compact />
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<XCircle size={14} />}
              onClick={handleAbandonar}
              className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600"
            >
              Abandonar
            </Button>
          </div>
        </div>

        {/* Barra de progresso */}
        <ProgressBar
          value={progresso}
          color={progresso < 40 ? 'brand' : progresso < 70 ? 'yellow' : 'green'}
          showLabel
          animated
        />

      </div>

      {/* ── Layout: Questão (esquerda) + ScoreBoard (direita) ───────── */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Questão — ocupa o máximo disponível */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 lg:p-7">
          <QuestionCard
            questao={questaoAtual}
            numero={indiceAtual + 1}
            total={total}
            resposta={respostaAtual}
            onResponder={responder}
            onAvancar={avancar}
            onRetroceder={retroceder}
            ultimaQuestao={indiceAtual === total - 1}
          />
        </div>

        {/* Placar lateral — visível em todas as telas */}
        <div className="lg:w-72 shrink-0">
          <ScoreBoard />
        </div>
      </div>
    </div>
  );
}
