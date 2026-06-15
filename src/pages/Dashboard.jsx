/**
 * Dashboard.jsx — Tela inicial com métricas e gráficos
 *
 * Exibe:
 *  • Saudação personalizada com nome do usuário
 *  • Cards de estatísticas: total de simulados, acertos, aproveitamento
 *  • Gráfico de desempenho histórico (recharts LineChart)
 *  • Gráfico de distribuição por área (recharts PieChart)
 *  • Últimos simulados realizados (lista com performance)
 *  • Ação rápida: Novo Simulado
 *
 * As estatísticas são salvas no localStorage após cada simulado concluído.
 * Sem histórico → exibe estado vazio com CTA para iniciar.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  ReferenceLine,
} from 'recharts';
import {
  Trophy, Target, Zap, BookOpen, TrendingUp,
  PlayCircle, Star, XCircle, Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card   from '../components/common/Card';
import Badge  from '../components/common/Badge';
import Button from '../components/common/Button';

// Cores para o gráfico de pizza por área
const AREA_CORES = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];
const AREA_LABELS = {
  linguagens:       'Linguagens',
  ciencias_humanas:  'C. Humanas',
  ciencias_natureza: 'C. Natureza',
  matematica:        'Matemática',
};

// Tooltip customizado
function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}{p.unit ?? ''}
        </p>
      ))}
    </div>
  );
}

// Card de estatística
function StatCard({ icon: Icon, label, value, sub, color }) {
  const colorMap = {
    brand:  'bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400',
    green:  'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    yellow: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    red:    'bg-rose-100 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400',
  };
  return (
    <Card hover className="animate-slideUp">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { usuario } = useAuth();

  // Carrega histórico de simulados do localStorage
  const historico = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('historico_simulados') ?? '[]');
    } catch {
      return [];
    }
  }, []);

  // Calcula estatísticas agregadas
  const stats = useMemo(() => {
    if (!historico.length) return null;

    const totalQuestoes  = historico.reduce((s, h) => s + h.total, 0);
    const totalAcertos   = historico.reduce((s, h) => s + h.pontos, 0);
    const totalErros     = totalQuestoes - totalAcertos;
    const aproveitamento = totalQuestoes > 0
      ? Math.round((totalAcertos / totalQuestoes) * 100)
      : 0;

    return { totalSimulados: historico.length, totalQuestoes, totalAcertos, totalErros, aproveitamento };
  }, [historico]);

  // Dados para gráfico de linha (últimos 8 simulados)
  const dadosLinha = useMemo(() => {
    return historico.slice(-8).map((h, i) => ({
      name:        `#${historico.length - (historico.slice(-8).length - 1 - i)}`,
      Aproveitamento: Math.round((h.pontos / h.total) * 100),
    }));
  }, [historico]);

  // Dados para gráfico de pizza por área
  const dadosPizza = useMemo(() => {
    const contagem = {};
    historico.forEach((h) => {
      const area = h.config?.area ?? h.config?.tipo ?? 'outro';
      contagem[area] = (contagem[area] ?? 0) + h.total;
    });
    return Object.entries(contagem).map(([area, value]) => ({
      name: AREA_LABELS[area] ?? area,
      value,
    }));
  }, [historico]);

  // Nome do usuário para saudação
  const nome = usuario?.nome?.split(' ')[0] ?? 'Aluno';
  const hora  = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  // Estado vazio (sem histórico)
  if (!historico.length) {
    return (
      <div className="animate-fadeIn space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {saudacao}, {nome}! 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Comece seus estudos fazendo o primeiro simulado
          </p>
        </div>

        {/* CTA de primeiro simulado */}
        <Card padding="lg" className="text-center">
          <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-brand-md glow-brand animate-bounceSoft">
            <PlayCircle size={38} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Seu dashboard está vazio
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Faça seu primeiro simulado para ver suas estatísticas, gráficos de desempenho
            e acompanhar sua evolução.
          </p>
          <Link to="/simulados">
            <Button variant="primary" size="lg" icon={<Zap size={18} />}>
              Começar agora
            </Button>
          </Link>
        </Card>

        {/* Dica cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🎯', title: 'Escolha o modo', desc: 'ENEM completo, por área ou por disciplina' },
            { icon: '📝', title: 'Responda as questões', desc: 'Uma por vez, no seu ritmo' },
            { icon: '📊', title: 'Acompanhe o progresso', desc: 'Veja seus acertos e pontos aqui' },
          ].map((tip) => (
            <Card key={tip.title} padding="md" className="text-center">
              <div className="text-3xl mb-2">{tip.icon}</div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{tip.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tip.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      {/* ── Saudação ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {saudacao}, {nome}! 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Continue se preparando — você está indo bem!
          </p>
        </div>
        <Link to="/simulados">
          <Button variant="primary" icon={<Zap size={16} />}>
            Novo Simulado
          </Button>
        </Link>
      </div>

      {/* ── Cards de estatísticas ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={BookOpen}    label="Simulados"      value={stats.totalSimulados}          sub="realizados"      color="brand"  />
        <StatCard icon={Target}      label="Questões"       value={stats.totalQuestoes}            sub="respondidas"     color="green"  />
        <StatCard icon={Trophy}      label="Acertos"        value={stats.totalAcertos}             sub="questões certas" color="yellow" />
        <StatCard icon={XCircle}     label="Erros"          value={stats.totalErros}               sub="questões erradas" color="red"   />
        <StatCard icon={TrendingUp}  label="Aproveitamento" value={`${stats.aproveitamento}%`}     sub="taxa de acerto"  color={stats.aproveitamento >= 60 ? 'green' : 'red'} />
      </div>

      {/* ── Gráficos ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Linha: aproveitamento nos últimos simulados */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-500" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              Curva de evolução — aproveitamento (%)
            </h3>
          </div>
          {dadosLinha.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dadosLinha} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAproveitamento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} width={30} unit="%" />
                <Tooltip content={<TooltipCustom />} />
                {/* Linha de referência: 60% mínimo */}
                <ReferenceLine
                  y={60}
                  stroke="#10b981"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{ value: '60%', position: 'insideTopRight', fontSize: 10, fill: '#10b981' }}
                />
                <Area
                  type="monotone"
                  dataKey="Aproveitamento"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#gradAproveitamento)"
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 5, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                  unit="%"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
              Realize mais simulados para ver a curva de evolução
            </div>
          )}
        </Card>

        {/* Pizza: distribuição por área */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-amber-500" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              Questões por área
            </h3>
          </div>
          {dadosPizza.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%" cy="45%"
                  outerRadius={70}
                  dataKey="value"
                  animationDuration={800}
                >
                  {dadosPizza.map((_, i) => (
                    <Cell key={i} fill={AREA_CORES[i % AREA_CORES.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipCustom />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
              Sem dados ainda
            </div>
          )}
        </Card>
      </div>

      {/* ── Histórico recente ──────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Trophy size={16} className="text-brand-500" />
            Últimos simulados
          </h3>
        </div>

        <div className="space-y-2">
          {historico.slice(-5).reverse().map((h, i) => {
            const pct   = Math.round((h.pontos / h.total) * 100);
            const cor   = pct >= 70 ? 'green' : pct >= 50 ? 'yellow' : 'red';
            const erros = h.total - h.pontos;
            const dataFormatada = h.data
              ? new Date(h.data).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              : null;
            const nivelLabel = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
            const nivelCor   = { facil: 'text-emerald-500', medio: 'text-amber-500', dificil: 'text-rose-500' };
            const nivel      = h.config?.nivel;
            const serieLabel = { '1_serie': '1º Colegial', '2_serie': '2º Colegial', '3_serie': '3º Colegial' };
            const serie      = h.config?.serie;
            return (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {/* Tipo */}
                <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-white" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {h.config?.label ?? 'Simulado'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{h.pontos} acertos</span>
                    {' · '}
                    <span className="text-rose-500 dark:text-rose-400 font-medium">{erros} erros</span>
                    {' · '}
                    {h.total} questões
                    {nivel && (
                      <span className={`ml-1 font-semibold ${nivelCor[nivel] ?? ''}`}>
                        · {nivelLabel[nivel] ?? nivel}
                      </span>
                    )}
                    {serie && (
                      <span className="ml-1 font-semibold text-violet-500 dark:text-violet-400">
                        · {serieLabel[serie] ?? serie}
                      </span>
                    )}
                  </p>
                  {dataFormatada && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {dataFormatada}
                    </p>
                  )}
                </div>
                {/* Badge percentual */}
                <Badge color={cor} size="md">{pct}%</Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
