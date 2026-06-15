import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Layers, Microscope, Zap, ChevronRight, ChevronLeft,
  Star, Clock, Hash, Sparkles, AlertCircle, Loader2, GraduationCap, School,
} from 'lucide-react';
import {
  gerarEnemCompleto, gerarPorArea, gerarPorDisciplina,
  listarSimuladosIA, obterSimuladoIA,
} from '../api/simulados';
import { useSimulado } from '../contexts/SimuladoContext';
import Card   from '../components/common/Card';
import Button from '../components/common/Button';

// ─── Constantes ────────────────────────────────────────────────────────────

const TIPOS_PRINCIPAIS = [
  {
    id:    'oficial',
    label: 'ENEM Completo',
    desc:  'Questões oficiais de provas anteriores',
    icon:  GraduationCap,
    cor:   'gradient-brand',
    badge: 'Popular',
    badgeCor: 'gradient-brand',
  },
  {
    id:    'ia',
    label: 'Gerado com I.A',
    desc:  'Simulados criados por inteligência artificial',
    icon:  Sparkles,
    cor:   'bg-violet-500',
    badge: 'Novo',
    badgeCor: 'bg-violet-500',
  },
];

const SUBTIPOS = [
  { id: 'enem_completo', label: 'Completo',       desc: 'As 4 áreas do ENEM misturadas', icon: Star,       cor: 'gradient-brand' },
  { id: 'por_area',      label: 'Por Área',        desc: 'Foca em uma área de conhecimento', icon: Layers,     cor: 'bg-emerald-500' },
  { id: 'por_disciplina',label: 'Por Disciplina',  desc: 'Questões de uma matéria',          icon: Microscope, cor: 'bg-amber-500'   },
];

const AREAS = [
  { valor: 'linguagens',        label: 'Linguagens',           icon: '📝' },
  { valor: 'ciencias_humanas',  label: 'Ciências Humanas',     icon: '🌍' },
  { valor: 'ciencias_natureza', label: 'Ciências da Natureza', icon: '🔬' },
  { valor: 'matematica',        label: 'Matemática',           icon: '📐' },
];

const DISCIPLINAS = [
  { valor: 'portugues',  label: 'Português',  icon: '📖' },
  { valor: 'literatura', label: 'Literatura', icon: '📚' },
  { valor: 'ingles',     label: 'Inglês',     icon: '🇬🇧' },
  { valor: 'matematica', label: 'Matemática', icon: '📐' },
  { valor: 'fisica',     label: 'Física',     icon: '⚛️' },
  { valor: 'quimica',    label: 'Química',    icon: '🧪' },
  { valor: 'biologia',   label: 'Biologia',   icon: '🌱' },
  { valor: 'historia',   label: 'História',   icon: '🏛️' },
  { valor: 'geografia',  label: 'Geografia',  icon: '🌎' },
  { valor: 'filosofia',  label: 'Filosofia',  icon: '🤔' },
  { valor: 'sociologia', label: 'Sociologia', icon: '👥' },
  { valor: 'ciencias',   label: 'Ciências',   icon: '🔭' },
];

// Apenas os 3 últimos anos para ENEM oficial
const ANOS_RECENTES = [2024, 2023, 2022];

const SERIES = [
  { valor: null,      label: 'Todos',       desc: 'Questões de todos os anos' },
  { valor: '1_serie', label: '1º Colegial', desc: '1ª série do Ensino Médio' },
  { valor: '2_serie', label: '2º Colegial', desc: '2ª série do Ensino Médio' },
  { valor: '3_serie', label: '3º Colegial', desc: '3ª série / pré-vestibular' },
];

const NIVEIS = [
  { valor: null,      label: 'Todos' },
  { valor: 'facil',   label: 'Fácil' },
  { valor: 'medio',   label: 'Médio' },
  { valor: 'dificil', label: 'Difícil' },
];

const TEMPOS = [
  { valor: 1800,   label: '30 min'  },
  { valor: 3600,   label: '1 hora'  },
  { valor: 5400,   label: '1h 30'   },
  { valor: 7200,   label: '2 horas' },
  { valor: 10800,  label: '3 horas' },
  { valor: 14400,  label: '4 horas' },
  { valor: 18000,  label: '5 horas' },
];

// ─── Componente ────────────────────────────────────────────────────────────

export default function EscolherSimulado() {
  const { iniciar } = useSimulado();
  const navigate    = useNavigate();

  // ── Navegação entre etapas
  const [tipoPrincipal, setTipoPrincipal] = useState(null); // 'oficial' | 'ia'
  const [subtipo,       setSubtipo]       = useState(null); // 'enem_completo' | 'por_area' | 'por_disciplina'

  // ── Filtros ENEM oficial
  const [area,        setArea]        = useState('linguagens');
  const [disciplina,  setDisciplina]  = useState('matematica');
  const [ano,         setAno]         = useState(null);
  const [nivel,       setNivel]       = useState(null);
  const [serie,       setSerie]       = useState(null);
  const [quantidade,  setQtd]         = useState(10);
  const [tempoLimite, setTempoLimite] = useState(1800);

  // ── Simulados IA
  const [simuladosIA,        setSimuladosIA]        = useState([]);
  const [loadingIA,          setLoadingIA]          = useState(false);
  const [erroIA,             setErroIA]             = useState(null);
  const [simuladoIaSelected, setSimuladoIaSelected] = useState(null);
  const [fuvestVariantId,    setFuvestVariantId]    = useState(null);

  // Agrupa variantes FUVEST (FUVEST / FUVEST_1SERIE / etc.) em uma única entrada
  const { simuladosDisplay, fuvestVariants } = useMemo(() => {
    const SERIE_LABEL = {
      FUVEST:        'Todas as Séries',
      FUVEST_1SERIE: '1ª Série',
      FUVEST_2SERIE: '2ª Série',
      FUVEST_3SERIE: '3ª Série',
    };
    const SERIE_ORDER = ['FUVEST', 'FUVEST_1SERIE', 'FUVEST_2SERIE', 'FUVEST_3SERIE'];

    let grupoAdicionado = false;
    const display  = [];
    const opcoes   = [];
    let defaultId  = null;

    simuladosIA.forEach((sim) => {
      if (sim.tipoExame?.startsWith('FUVEST')) {
        if (!grupoAdicionado) {
          display.push({ id: '__fuvest__', nome: 'Simulado FUVEST 2025 — 2° Grau', tipoExame: 'FUVEST', _isGrupo: true });
          grupoAdicionado = true;
        }
        opcoes.push({ id: sim.id, tipo: sim.tipoExame, label: SERIE_LABEL[sim.tipoExame] ?? sim.tipoExame, qtdQuestoes: sim.qtdQuestoes });
        if (sim.tipoExame === 'FUVEST') defaultId = sim.id;
      } else {
        display.push(sim);
      }
    });

    opcoes.sort((a, b) => SERIE_ORDER.indexOf(a.tipo) - SERIE_ORDER.indexOf(b.tipo));
    const totalGrupo = opcoes.find((o) => o.tipo === 'FUVEST')?.qtdQuestoes ?? opcoes[0]?.qtdQuestoes ?? 0;
    const grupo = display.find((s) => s._isGrupo);
    if (grupo) grupo.qtdQuestoes = totalGrupo;

    return { simuladosDisplay: display, fuvestVariants: { opcoes, defaultId } };
  }, [simuladosIA]);

  // ── Ação
  const [carregando, setCarregando] = useState(false);
  const [erro,       setErro]       = useState(null);

  // Carrega lista de simulados IA quando selecionado
  useEffect(() => {
    if (tipoPrincipal !== 'ia') return;
    setLoadingIA(true);
    setErroIA(null);
    listarSimuladosIA()
      .then(setSimuladosIA)
      .catch(() => setErroIA('Não foi possível carregar os simulados. Tente novamente.'))
      .finally(() => setLoadingIA(false));
  }, [tipoPrincipal]);

  // ── Handlers
  const selecionarTipo = (id) => {
    setTipoPrincipal(id);
    setSubtipo(null);
    setSerie(null);
    setSimuladoIaSelected(null);
    setFuvestVariantId(null);
    setErro(null);
  };

  const handleIniciarOficial = async () => {
    setCarregando(true);
    setErro(null);
    try {
      let dados, label;

      const serieLabel = SERIES.find((s) => s.valor === serie)?.label ?? null;

      if (subtipo === 'enem_completo') {
        dados = await gerarEnemCompleto({ ano, nivel, serie, quantidadePorArea: quantidade });
        label = `ENEM Completo${ano ? ` – ${ano}` : ''}${serieLabel && serie ? ` · ${serieLabel}` : ''}`;
      } else if (subtipo === 'por_area') {
        dados = await gerarPorArea({ area, ano, nivel, serie, quantidade });
        label = `${AREAS.find((a) => a.valor === area)?.label}${ano ? ` – ${ano}` : ''}${serieLabel && serie ? ` · ${serieLabel}` : ''}`;
      } else {
        dados = await gerarPorDisciplina({ disciplina, ano, nivel, serie, quantidade });
        label = `${DISCIPLINAS.find((d) => d.valor === disciplina)?.label}${ano ? ` – ${ano}` : ''}${serieLabel && serie ? ` · ${serieLabel}` : ''}`;
      }

      if (!dados?.questoes?.length) {
        setErro('Nenhuma questão encontrada. Tente outros filtros.');
        return;
      }

      iniciar(dados.questoes, {
        tipo:       subtipo,
        area:       subtipo === 'por_area'       ? area       : null,
        disciplina: subtipo === 'por_disciplina' ? disciplina : null,
        ano, nivel, serie, quantidade, label, tempoLimite,
      });
      navigate('/simulado');
    } catch (err) {
      setErro(err.response?.data?.mensagem ?? 'Erro ao carregar questões. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleIniciarIA = async () => {
    if (!simuladoIaSelected) return;
    setCarregando(true);
    setErro(null);
    try {
      const efId = simuladoIaSelected._isGrupo
        ? (fuvestVariantId ?? fuvestVariants.defaultId)
        : simuladoIaSelected.id;

      const variantLabel = simuladoIaSelected._isGrupo
        ? fuvestVariants.opcoes.find((o) => o.id === efId)?.label ?? 'Todas as Séries'
        : null;

      const dados = await obterSimuladoIA(efId);
      if (!dados?.questoes?.length) {
        setErro('Este simulado não possui questões disponíveis.');
        return;
      }
      iniciar(dados.questoes, {
        tipo:        'ia',
        label:       simuladoIaSelected._isGrupo
          ? `${simuladoIaSelected.nome} · ${variantLabel}`
          : simuladoIaSelected.nome,
        tipoExame:   simuladoIaSelected.tipoExame,
        tempoLimite: 0,
      });
      navigate('/simulado');
    } catch {
      setErro('Erro ao carregar o simulado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const podeIniciar = tipoPrincipal === 'ia'
    ? !!simuladoIaSelected
    : tipoPrincipal === 'oficial' && subtipo !== null;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto space-y-6">

      {/* Cabeçalho */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="text-brand-500" size={22} />
          Configurar Simulado
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Escolha o tipo e configure as opções do seu simulado
        </p>
      </div>

      {/* ── Etapa 1: Tipo principal ──────────────────────────────────────── */}
      <Card padding="md">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          1. Tipo de simulado
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TIPOS_PRINCIPAIS.map(({ id, label, desc, icon: Icon, cor, badge, badgeCor }) => (
            <button
              key={id}
              onClick={() => selecionarTipo(id)}
              className={[
                'relative p-5 rounded-xl border-2 text-left transition-all duration-200',
                tipoPrincipal === id
                  ? id === 'ia'
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                    : 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 bg-white dark:bg-slate-800/40',
              ].join(' ')}
            >
              {badge && (
                <span className={`absolute -top-2 right-3 text-xs ${badgeCor} text-white px-2 py-0.5 rounded-full font-semibold`}>
                  {badge}
                </span>
              )}
              <div className={`w-11 h-11 ${cor} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={22} className="text-white" />
              </div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* ── Etapa 2 (ENEM): Sub-tipo / modalidade ─────────────────────────── */}
      {tipoPrincipal === 'oficial' && (
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setTipoPrincipal(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              2. Modalidade
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUBTIPOS.map(({ id, label, desc, icon: Icon, cor }) => (
              <button
                key={id}
                onClick={() => setSubtipo(id)}
                className={[
                  'p-4 rounded-xl border-2 text-left transition-all duration-200',
                  subtipo === id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 bg-white dark:bg-slate-800/40',
                ].join(' ')}
              >
                <div className={`w-10 h-10 ${cor} rounded-xl flex items-center justify-center mb-2`}>
                  <Icon size={19} className="text-white" />
                </div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* ── Etapa 2b (ENEM): Série / Ano escolar ────────────────────────────── */}
      {tipoPrincipal === 'oficial' && subtipo !== null && (
        <Card padding="md">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <School size={13} /> Série / Ano escolar
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SERIES.map(({ valor, label, desc }) => (
              <button
                key={String(valor)}
                onClick={() => setSerie(valor)}
                className={[
                  'p-3 rounded-xl border-2 text-left transition-all duration-200',
                  serie === valor
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 bg-white dark:bg-slate-800/40',
                ].join(' ')}
              >
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{desc}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* ── Etapa 3 (ENEM): Área / Disciplina + Filtros ───────────────────── */}
      {tipoPrincipal === 'oficial' && subtipo !== null && (
        <>
          {/* Seletor de Área */}
          {subtipo === 'por_area' && (
            <Card padding="md">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                3. Área de conhecimento
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {AREAS.map(({ valor, label, icon }) => (
                  <button
                    key={valor}
                    onClick={() => setArea(valor)}
                    className={[
                      'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                      area === valor
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/40',
                    ].join(' ')}
                  >
                    <span className="text-xl">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Seletor de Disciplina */}
          {subtipo === 'por_disciplina' && (
            <Card padding="md">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                3. Disciplina
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DISCIPLINAS.map(({ valor, label, icon }) => (
                  <button
                    key={valor}
                    onClick={() => setDisciplina(valor)}
                    className={[
                      'flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-sm font-medium',
                      disciplina === valor
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/40',
                    ].join(' ')}
                  >
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Filtros opcionais */}
          <Card padding="md">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              {subtipo === 'enem_completo' ? '3.' : '4.'} Filtros opcionais
            </h3>

            {/* Ano — apenas últimos 3 anos */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-2">
                <Clock size={12} /> Ano de referência
              </label>
              <div className="flex gap-2 flex-wrap">
                {[null, ...ANOS_RECENTES].map((a) => (
                  <button
                    key={String(a)}
                    onClick={() => setAno(a)}
                    className={[
                      'px-4 py-1.5 rounded-xl border text-sm font-semibold transition-all',
                      ano === a
                        ? 'gradient-brand text-white border-transparent'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400',
                    ].join(' ')}
                  >
                    {a ?? 'Todos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Nível */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-2">
                <Star size={12} /> Nível de dificuldade
              </label>
              <div className="flex gap-2 flex-wrap">
                {NIVEIS.map(({ valor, label }) => (
                  <button
                    key={String(valor)}
                    onClick={() => setNivel(valor)}
                    className={[
                      'px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                      nivel === valor
                        ? 'gradient-brand text-white border-transparent'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-2">
                <Hash size={12} />
                Questões:{' '}
                <span className="text-brand-600 dark:text-brand-400 font-bold ml-1">{quantidade}</span>
                {subtipo === 'enem_completo' && (
                  <span className="text-slate-400 ml-1">por área ({quantidade * 4} total)</span>
                )}
              </label>
              <input
                type="range"
                min={1}
                max={subtipo === 'enem_completo' ? 20 : 45}
                value={quantidade}
                onChange={(e) => setQtd(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #6366f1 ${(quantidade / (subtipo === 'enem_completo' ? 20 : 45)) * 100}%, #e2e8f0 0%)`,
                }}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1</span>
                <span>{subtipo === 'enem_completo' ? '20 por área' : '45'}</span>
              </div>
            </div>

            {/* Tempo limite */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-2">
                <Clock size={12} /> Tempo limite
              </label>
              <div className="flex gap-2 flex-wrap">
                {TEMPOS.map(({ valor, label }) => (
                  <button
                    key={valor}
                    onClick={() => setTempoLimite(valor)}
                    className={[
                      'px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                      tempoLimite === valor
                        ? 'gradient-brand text-white border-transparent'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ── I.A: Lista de simulados disponíveis ───────────────────────────── */}
      {tipoPrincipal === 'ia' && (
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setTipoPrincipal(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              2. Escolher simulado I.A
            </h3>
          </div>

          {loadingIA && (
            <div className="flex justify-center py-10">
              <Loader2 size={30} className="animate-spin text-violet-500" />
            </div>
          )}

          {erroIA && !loadingIA && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
              <AlertCircle size={15} />
              {erroIA}
            </div>
          )}

          {!loadingIA && !erroIA && simuladosIA.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles size={26} className="text-violet-400" />
              </div>
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                Nenhum simulado disponível
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                Os simulados gerados por I.A aparecerão aqui assim que forem adicionados.
              </p>
            </div>
          )}

          {!loadingIA && simuladosDisplay.length > 0 && (
            <div className="space-y-2">
              {simuladosDisplay.map((sim) => {
                const isSelected = simuladoIaSelected?.id === sim.id;
                const isGrupo    = sim._isGrupo;
                return (
                  <div key={sim.id}>
                    <button
                      onClick={() => {
                        setSimuladoIaSelected(sim);
                        if (isGrupo) setFuvestVariantId(fuvestVariants.defaultId);
                      }}
                      className={[
                        'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150',
                        isSelected
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 bg-white dark:bg-slate-800/40',
                      ].join(' ')}
                    >
                      <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center shrink-0">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                          {sim.nome}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {sim.tipoExame && (
                            <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-medium">
                              {sim.tipoExame}
                            </span>
                          )}
                          {isGrupo && (
                            <span className="text-xs text-slate-400">por série · 144 questões cada</span>
                          )}
                          {!isGrupo && sim.qtdQuestoes > 0 && (
                            <span className="text-xs text-slate-400">{sim.qtdQuestoes} questões</span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Seletor de série — só aparece quando o grupo FUVEST está selecionado */}
                    {isGrupo && isSelected && fuvestVariants.opcoes.length > 0 && (
                      <div className="mt-2 ml-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/50">
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                          <School size={12} />
                          Escolher série
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {fuvestVariants.opcoes.map((op) => {
                            const ativa = (fuvestVariantId ?? fuvestVariants.defaultId) === op.id;
                            return (
                              <button
                                key={op.id}
                                onClick={() => setFuvestVariantId(op.id)}
                                className={[
                                  'px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all',
                                  ativa
                                    ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-400',
                                ].join(' ')}
                              >
                                {op.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Erro de ação */}
      {erro && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm animate-slideDown">
          ⚠️ {erro}
        </div>
      )}

      {/* Botão Iniciar */}
      {podeIniciar && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={carregando}
          onClick={tipoPrincipal === 'ia' ? handleIniciarIA : handleIniciarOficial}
          icon={!carregando && <Zap size={18} />}
          className={`${tipoPrincipal === 'ia' ? 'bg-violet-600 hover:bg-violet-700 border-violet-600' : 'shadow-brand-lg glow-brand'}`}
        >
          {carregando ? 'Carregando questões...' : 'Iniciar Simulado'}
          {!carregando && <ChevronRight size={18} />}
        </Button>
      )}
    </div>
  );
}
