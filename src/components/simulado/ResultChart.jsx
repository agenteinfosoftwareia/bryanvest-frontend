/**
 * ResultChart.jsx — Gráficos do resultado do simulado (Recharts)
 *
 * Dois gráficos:
 *  1. PieChart: proporção Acertos × Erros (donut chart com animação)
 *  2. BarChart: desempenho por área de conhecimento
 *
 * Props:
 *  • pontos:   número de acertos
 *  • erros:    número de erros
 *  • total:    total de questões
 *  • porArea:  objeto { area: { acertos, total } } (opcional)
 */
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, RadialBarChart, RadialBar,
} from 'recharts';

// Cores dos gráficos
const CORES = {
  acerto:     '#10b981', // emerald-500
  erro:       '#f43f5e', // rose-500
  brand:      '#6366f1', // indigo-500
  secondary:  '#8b5cf6', // violet-500
};

// Labels legíveis para as áreas
const AREA_LABELS = {
  linguagens:       'Linguagens',
  ciencias_humanas:  'C. Humanas',
  ciencias_natureza: 'C. Natureza',
  matematica:        'Matemática',
};

// Tooltip customizado para o Recharts
function TooltipCustom({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl text-sm">
      <p className="font-semibold text-slate-800 dark:text-slate-200">
        {payload[0].name}
      </p>
      <p style={{ color: payload[0].fill ?? payload[0].color }}>
        {payload[0].value} {payload[0].unit ?? ''}
      </p>
    </div>
  );
}

// ── Gráfico de rosca: Acertos × Erros ────────────────────────────────────
export function DonutAcertos({ pontos, erros }) {
  const data = [
    { name: 'Acertos', value: pontos, color: CORES.acerto },
    { name: 'Erros',   value: erros,  color: CORES.erro   },
  ];

  const total     = pontos + erros;
  const percentual = total > 0 ? Math.round((pontos / total) * 100) : 0;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            animationBegin={0}
            animationDuration={1000}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                strokeWidth={0}
              />
            ))}
          </Pie>
          <Tooltip content={<TooltipCustom />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Percentual centralizado dentro do donut */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-black gradient-brand-text animate-countUp">
          {percentual}%
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          de acerto
        </span>
      </div>
    </div>
  );
}

// ── Gráfico de barras: desempenho por área ────────────────────────────────
export function BarPorArea({ porArea }) {
  if (!porArea || Object.keys(porArea).length === 0) return null;

  // Transforma o objeto em array para o Recharts
  const data = Object.entries(porArea).map(([area, stats]) => ({
    area: AREA_LABELS[area] ?? area,
    Acertos: stats.acertos,
    Erros:   stats.total - stats.acertos,
    '%':     stats.total > 0 ? Math.round((stats.acertos / stats.total) * 100) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={28} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
        <XAxis
          dataKey="area"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={24}
        />
        <Tooltip content={<TooltipCustom />} cursor={{ fill: 'rgba(99,102,241,0.07)' }} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="Acertos" fill={CORES.acerto} radius={[6,6,0,0]} animationDuration={800} />
        <Bar dataKey="Erros"   fill={CORES.erro}   radius={[6,6,0,0]} animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Radial chart: taxa de acerto ──────────────────────────────────────────
export function RadialAcerto({ percentual }) {
  const data = [
    { name: 'Acerto', value: percentual, fill: CORES.brand },
  ];

  return (
    <ResponsiveContainer width="100%" height={160}>
      <RadialBarChart
        cx="50%" cy="50%"
        innerRadius="60%" outerRadius="90%"
        data={data}
        startAngle={90} endAngle={-270}
      >
        <RadialBar
          minAngle={5}
          dataKey="value"
          cornerRadius={8}
          background={{ fill: '#e2e8f0' }}
          className="dark:bg-slate-700"
          animationDuration={1000}
        />
        <Tooltip content={<TooltipCustom />} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
