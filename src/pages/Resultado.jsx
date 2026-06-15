/**
 * Resultado.jsx — Tela de resultado do simulado
 *
 * Exibe após o aluno responder todas as questões:
 *  • Pontuação final e percentual de acerto com animação
 *  • Donut chart: Acertos × Erros
 *  • Bar chart: desempenho por área
 *  • Mensagem motivacional baseada no aproveitamento
 *  • Lista de questões com indicação de certo/errado
 *  • Botões: Refazer simulado | Novo simulado | Ver dashboard
 *
 * Após exibir, salva o resultado no localStorage (histórico do dashboard).
 */
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy, RotateCcw, Home, CheckCircle, XCircle,
  TrendingUp, Lightbulb, BookOpen, Clock,
} from 'lucide-react';
import { useSimulado } from '../contexts/SimuladoContext';
import { DonutAcertos, BarPorArea } from '../components/simulado/ResultChart';
import Button from '../components/common/Button';
import Card   from '../components/common/Card';
import Badge  from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';

// Mensagens motivacionais por faixa de aproveitamento
function getMensagem(pct) {
  if (pct >= 90) return { emoji: '🏆', texto: 'Excelente! Desempenho extraordinário!', cor: 'text-emerald-600 dark:text-emerald-400' };
  if (pct >= 70) return { emoji: '🎯', texto: 'Ótimo resultado! Você está no caminho certo.', cor: 'text-emerald-600 dark:text-emerald-400' };
  if (pct >= 50) return { emoji: '📈', texto: 'Bom trabalho! Continue praticando.', cor: 'text-amber-600 dark:text-amber-400' };
  if (pct >= 30) return { emoji: '💪', texto: 'Não desanime, revise os erros e tente novamente!', cor: 'text-rose-600 dark:text-rose-400' };
  return { emoji: '📚', texto: 'Hora de estudar mais! Cada erro é uma oportunidade de aprender.', cor: 'text-rose-600 dark:text-rose-400' };
}

export default function Resultado() {
  const { questoes, respostas, pontos, total, percentual, config, resetar, tempoPorQuestao } = useSimulado();

  // Formata segundos como "Xs" ou "Xm Ys"
  const formatarTempo = (seg) => {
    if (!seg) return null;
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s > 0 ? `${s}s` : ''}`.trim();
  };
  const navigate    = useNavigate();
  const salvo       = useRef(false); // evita salvar duas vezes no histórico

  // Se não há resultado (aluno acessou direto), redireciona
  useEffect(() => {
    if (!questoes.length) {
      navigate('/simulados', { replace: true });
    }
  }, [questoes.length, navigate]);

  // Salva no histórico do localStorage
  useEffect(() => {
    if (!questoes.length || salvo.current) return;
    salvo.current = true;

    const historico = JSON.parse(localStorage.getItem('historico_simulados') ?? '[]');
    historico.push({
      data:    new Date().toISOString(),
      pontos,
      total,
      config: {
        label: config?.label ?? 'Simulado',
        tipo:  config?.tipo,
        area:  config?.area,
        nivel: config?.nivel ?? null,
        serie: config?.serie ?? null,
      },
    });
    localStorage.setItem('historico_simulados', JSON.stringify(historico));
  }, [questoes.length, pontos, total, config]);

  const erros = total - pontos;
  const mensagem = getMensagem(percentual);

  // Distribuição de acertos por área
  const porArea = questoes.reduce((acc, q) => {
    const area = q.area ?? 'outro';
    if (!acc[area]) acc[area] = { acertos: 0, total: 0 };
    acc[area].total++;
    if (respostas[q.id] === q._respostaCorreta) acc[area].acertos++;
    return acc;
  }, {});

  // Cor do resultado
  const corPct = percentual >= 70 ? 'green' : percentual >= 50 ? 'yellow' : 'red';

  const handleRefazer = () => {
    resetar();
    navigate('/simulados');
  };

  if (!questoes.length) return null;

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto space-y-6">
      {/* ── Cabeçalho: resultado principal ──────────────────────── */}
      <Card padding="lg" className="text-center">
        {/* Ícone troféu */}
        <div className={[
          'w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounceSoft',
          percentual >= 70 ? 'gradient-success glow-success' : percentual >= 50 ? 'gradient-warning' : 'gradient-danger glow-danger',
        ].join(' ')}>
          <Trophy size={38} className="text-white" />
        </div>

        {/* Pontuação */}
        <div className="mb-2">
          <span className="text-6xl font-black gradient-brand-text animate-countUp">
            {pontos}
          </span>
          <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
            /{total}
          </span>
        </div>

        {/* Percentual */}
        <Badge color={corPct} size="md" className="mx-auto mb-3">
          {percentual}% de aproveitamento
        </Badge>

        {/* Mensagem motivacional */}
        <p className={`text-base font-semibold ${mensagem.cor}`}>
          {mensagem.emoji} {mensagem.texto}
        </p>

        {/* Barra de progresso */}
        <ProgressBar
          value={percentual}
          color={corPct}
          showLabel
          animated
          className="mt-4 max-w-sm mx-auto"
        />

        {/* Stats rápidos */}
        <div className="flex justify-center gap-6 mt-5">
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-500">{pontos}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Acertos</p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-black text-rose-500">{erros}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Erros</p>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-black text-slate-600 dark:text-slate-300">{total}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          </div>
        </div>
      </Card>

      {/* ── Gráficos ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Donut */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-500" />
            Acertos × Erros
          </h3>
          <DonutAcertos pontos={pontos} erros={erros} />
        </Card>

        {/* Barra por área (se houver dados) */}
        {Object.keys(porArea).length > 1 && (
          <Card>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
              <BookOpen size={16} className="text-brand-500" />
              Por área
            </h3>
            <BarPorArea porArea={porArea} />
          </Card>
        )}
      </div>

      {/* ── Gabarito: questões respondidas ─────────────────────── */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <BookOpen size={14} />
          Gabarito
        </h3>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {questoes.map((q, idx) => {
            const resposta  = respostas[q.id];
            const acertou   = resposta === q._respostaCorreta;
            // Mostra texto da alternativa respondida
            const altTexto  = q._alternativas?.find((a) => a.letra === resposta)?.texto ?? '—';
            const certaTexto = q._alternativas?.find((a) => a.letra === q._respostaCorreta)?.texto ?? '—';

            return (
              <div
                key={q.id}
                className={[
                  'flex items-start gap-3 p-3 rounded-xl border',
                  acertou
                    ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/20',
                ].join(' ')}
              >
                {/* Ícone */}
                {acertou
                  ? <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  : <XCircle    size={18} className="text-rose-500 shrink-0 mt-0.5" />
                }

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    Questão {idx + 1}
                    {q.disciplina && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        {q.disciplina}
                      </span>
                    )}
                  </p>

                  {/* Resposta do aluno */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                    Sua resposta: <span className="font-semibold uppercase">{resposta ?? '—'}</span>
                    {!acertou && (
                      <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                        Correta: <span className="font-semibold uppercase">{q._respostaCorreta}</span>
                      </span>
                    )}
                  </p>
                </div>

                {/* Tempo gasto + badge */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge color={acertou ? 'green' : 'red'} size="sm">
                    {acertou ? '+1' : '0'}
                  </Badge>
                  {formatarTempo(tempoPorQuestao[q.id]) && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-slate-400 dark:text-slate-500">
                      <Clock size={10} />
                      {formatarTempo(tempoPorQuestao[q.id])}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Dica baseada no resultado ─────────────────────────── */}
      {percentual < 60 && (
        <Card className="border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/10">
          <div className="flex items-start gap-3">
            <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Dica de melhoria
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Você está abaixo de 60%. Tente refazer com questões de nível "Fácil"
                para reforçar a base, depois avance para "Médio" e "Difícil".
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Botões de ação ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<RotateCcw size={16} />}
          onClick={handleRefazer}
        >
          Novo Simulado
        </Button>
        <Link to="/dashboard" className="flex-1">
          <Button variant="secondary" size="lg" fullWidth icon={<Home size={16} />}>
            Ver Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
