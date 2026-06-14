/**
 * EscolherSimulado.jsx — Tela de configuração e início do simulado
 *
 * O aluno escolhe:
 *  1. Tipo: ENEM Completo | Por Área | Por Disciplina
 *  2. Filtros opcionais: Ano (2009-2024), Nível (fácil/médio/difícil)
 *  3. Quantidade de questões
 *
 * Ao clicar em "Iniciar", chama a API, carrega as questões no
 * SimuladoContext e redireciona para /simulado.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Layers, Microscope,
  Zap, ChevronRight, Star, Clock, Hash, Sparkles,
} from 'lucide-react';
import { gerarEnemCompleto, gerarPorArea, gerarPorDisciplina, gerarComIA } from '../api/simulados';
import { useSimulado } from '../contexts/SimuladoContext';
import Card   from '../components/common/Card';
import Button from '../components/common/Button';
import Badge  from '../components/common/Badge';

// ─── Dados: Tipos de simulado ─────────────────────────────────────────────
const TIPOS = [
  {
    id:    'enem_completo',
    label: 'ENEM Completo',
    desc:  'Questões das 4 áreas do ENEM misturadas',
    icon:  Star,
    color: 'gradient-brand',
    popular: true,
  },
  {
    id:    'por_area',
    label: 'Por Área',
    desc:  'Foca em uma área de conhecimento',
    icon:  Layers,
    color: 'bg-emerald-500',
  },
  {
    id:    'por_disciplina',
    label: 'Por Disciplina',
    desc:  'Questões de uma matéria específica',
    icon:  Microscope,
    color: 'bg-amber-500',
  },
  {
    id:    'gerar_ia',
    label: 'Gerar com IA',
    desc:  'Questões criadas por IA sobre qualquer tema',
    icon:  Sparkles,
    color: 'bg-violet-600',
    novo:  true,
  },
];

// ─── Dados: Áreas ─────────────────────────────────────────────────────────
const AREAS = [
  { valor: 'linguagens',        label: 'Linguagens',          icon: '📝' },
  { valor: 'ciencias_humanas',  label: 'Ciências Humanas',    icon: '🌍' },
  { valor: 'ciencias_natureza', label: 'Ciências da Natureza',icon: '🔬' },
  { valor: 'matematica',        label: 'Matemática',          icon: '📐' },
];

// ─── Dados: Disciplinas ───────────────────────────────────────────────────
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

// Anos disponíveis
const ANOS = [null, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];
const NIVEIS = [
  { valor: null,      label: 'Todos os níveis' },
  { valor: 'facil',   label: 'Fácil',   cor: 'green' },
  { valor: 'medio',   label: 'Médio',   cor: 'yellow' },
  { valor: 'dificil', label: 'Difícil', cor: 'red' },
];

// Opções de tempo limite (0 = sem limite)
const TIPOS_PROVA_IA = [
  { valor: 'ENEM',      label: 'ENEM',      emoji: '🎓' },
  { valor: 'FUVEST',    label: 'FUVEST',    emoji: '🏛️' },
  { valor: 'UNICAMP',   label: 'UNICAMP',   emoji: '🔬' },
  { valor: 'UNESP',     label: 'UNESP',     emoji: '📘' },
  { valor: 'VESTIBULAR',label: 'Vestibular',emoji: '📝' },
  { valor: 'CONCURSO',  label: 'Concurso',  emoji: '⚖️' },
  { valor: 'LIVRE',     label: 'Livre',     emoji: '✨' },
];

const TEMPOS = [
  { valor: 0,     label: 'Sem limite', icon: '∞' },
  { valor: 1800,  label: '30 min',     icon: '⏱' },
  { valor: 3600,  label: '1 hora',     icon: '⏱' },
  { valor: 7200,  label: '2 horas',    icon: '⏱' },
  { valor: 10800, label: '3 horas',    icon: '⏱' },
];

export default function EscolherSimulado() {
  const { iniciar, setCarregando, setErro } = useSimulado();
  const navigate = useNavigate();

  // Configuração selecionada pelo aluno
  const [tipo,        setTipo]       = useState('enem_completo');
  const [area,        setArea]       = useState('linguagens');
  const [disciplina,  setDisciplina] = useState('matematica');
  const [ano,         setAno]        = useState(null);
  const [nivel,       setNivel]      = useState(null);
  const [quantidade,  setQtd]        = useState(10);
  const [tempoLimite, setTempoLimite]= useState(0);
  const [tema,        setTema]       = useState('');
  const [nomeProva,   setNomeProva]  = useState('');
  const [tipoProvaIA, setTipoProvaIA]= useState('ENEM');
  const [areasIA,       setAreasIA]      = useState([]);
  const [disciplinasIA, setDisciplinasIA] = useState([]);
  const [carregando,  setLocalLoad]  = useState(false);
  const [erro,        setLocalErro]  = useState(null);

  // Lança o simulado: chama API e popula o contexto
  const handleIniciar = async () => {
    setLocalLoad(true);
    setLocalErro(null);

    try {
      let dados;
      let configLabel;

      if (tipo === 'gerar_ia') {
        if (!tema.trim()) {
          setLocalErro('Descreva o tema ou assunto que a IA deve criar as questões.');
          setLocalLoad(false);
          return;
        }
        const tipoMap = { ENEM: 'Enem', FUVEST: 'Fuvest', UNICAMP: 'Unicamp', UNESP: 'Unesp', VESTIBULAR: 'Vestibular', CONCURSO: 'Concurso', LIVRE: 'Livre' };
        dados = await gerarComIA({
          tipo:        tipoMap[tipoProvaIA] ?? 'Enem',
          qtdQuestoes: quantidade,
          nivel:       nivel || undefined,
          areas:       areasIA.length > 0 ? areasIA : undefined,
          disciplinas: disciplinasIA.length > 0 ? disciplinasIA : undefined,
          tema:        tema.trim() || undefined,
          publico:     false,
        });
        configLabel = nomeProva.trim() || `${tipoProvaIA}${tema.trim() ? ` – ${tema.trim().slice(0, 30)}` : ''}`;
      } else if (tipo === 'enem_completo') {
        dados = await gerarEnemCompleto({ ano, nivel, quantidadePorArea: quantidade });
        configLabel = `ENEM Completo${ano ? ` – ${ano}` : ''}`;
      } else if (tipo === 'por_area') {
        dados = await gerarPorArea({ area, ano, nivel, quantidade });
        configLabel = `${AREAS.find((a) => a.valor === area)?.label} ${ano ? `– ${ano}` : ''}`;
      } else {
        dados = await gerarPorDisciplina({ disciplina, ano, nivel, quantidade });
        configLabel = `${DISCIPLINAS.find((d) => d.valor === disciplina)?.label} ${ano ? `– ${ano}` : ''}`;
      }

      if (!dados?.questoes?.length) {
        setLocalErro('Nenhuma questão encontrada. Tente outros filtros ou reformule o tema.');
        return;
      }

      iniciar(dados.questoes, {
        tipo,
        area:        tipo === 'por_area'        ? area       : null,
        disciplina:  tipo === 'por_disciplina'  ? disciplina : null,
        tema:        tipo === 'gerar_ia'        ? tema.trim() : null,
        geradoPorIA: tipo === 'gerar_ia',
        ano,
        nivel,
        quantidade,
        label:       configLabel,
        tempoLimite,
      });

      // Navega para o simulado em andamento
      navigate('/simulado');
    } catch (err) {
      const msg = err.response?.data?.mensagem ?? 'Erro ao carregar questões. Tente novamente.';
      setLocalErro(msg);
    } finally {
      setLocalLoad(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="text-brand-500" size={22} />
          Configurar Simulado
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Escolha o tipo, filtros e quantidade de questões
        </p>
      </div>

      {/* ── Passo 1: Tipo ────────────────────────────────────────── */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
          1. Tipo de simulado
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIPOS.map(({ id, label, desc, icon: Icon, color, popular, novo }) => (
            <button
              key={id}
              onClick={() => setTipo(id)}
              className={[
                'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                tipo === id
                  ? id === 'gerar_ia'
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                    : 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 bg-white dark:bg-slate-800/40',
              ].join(' ')}
            >
              {popular && (
                <span className="absolute -top-2 right-3 text-xs gradient-brand text-white px-2 py-0.5 rounded-full font-semibold">
                  Popular
                </span>
              )}
              {novo && (
                <span className="absolute -top-2 right-3 text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  Novo ✨
                </span>
              )}
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* ── Passo 2: Configuração da IA ──────────────────────────── */}
      {tipo === 'gerar_ia' && (
        <Card padding="md" className="border-2 border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20">
          <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Sparkles size={14} /> 2. Configure sua prova com IA
          </h3>
          <div className="space-y-3">
            {/* Tipo de prova */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Tipo de prova
              </label>
              <div className="flex flex-wrap gap-2">
                {TIPOS_PROVA_IA.map(({ valor, label, emoji }) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setTipoProvaIA(valor)}
                    className={[
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all',
                      tipoProvaIA === valor
                        ? 'border-violet-500 bg-violet-600 text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/40 hover:border-violet-300',
                    ].join(' ')}
                  >
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Área(s) de conhecimento */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Área(s) de conhecimento{' '}
                <span className="text-slate-400">(deixe vazio para todas)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map(({ valor, label, icon }) => {
                  const selecionada = areasIA.includes(valor);
                  return (
                    <button
                      key={valor}
                      type="button"
                      onClick={() =>
                        setAreasIA((prev) =>
                          selecionada ? prev.filter((v) => v !== valor) : [...prev, valor]
                        )
                      }
                      className={[
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all',
                        selecionada
                          ? 'border-violet-500 bg-violet-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/40 hover:border-violet-300',
                      ].join(' ')}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matéria(s) */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Matéria(s){' '}
                <span className="text-slate-400">(deixe vazio para todas)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DISCIPLINAS.map(({ valor, label, icon }) => {
                  const selecionada = disciplinasIA.includes(valor);
                  return (
                    <button
                      key={valor}
                      type="button"
                      onClick={() =>
                        setDisciplinasIA((prev) =>
                          selecionada ? prev.filter((v) => v !== valor) : [...prev, valor]
                        )
                      }
                      className={[
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all',
                        selecionada
                          ? 'border-violet-500 bg-violet-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/40 hover:border-violet-300',
                      ].join(' ')}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nome da prova */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                Nome da prova <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={nomeProva}
                onChange={(e) => setNomeProva(e.target.value)}
                placeholder="Ex: Simulado de Inteligência Artificial"
                maxLength={80}
                className="input-custom"
              />
            </div>
            {/* Tema / instrução */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                Tema ou assunto <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex: Revolução Industrial, Fotossíntese, Equações do 2º grau, Revolução Francesa..."
                rows={3}
                maxLength={500}
                className="input-custom resize-none"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{tema.length}/500</p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Passo 2: Área ou Disciplina (condicional) ─────────────── */}
      {tipo === 'por_area' && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
            2. Área de conhecimento
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {AREAS.map(({ valor, label, icon }) => (
              <button
                key={valor}
                onClick={() => setArea(valor)}
                className={[
                  'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium text-left',
                  area === valor
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/40',
                ].join(' ')}
              >
                <span className="text-xl">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </Card>
      )}

      {tipo === 'por_disciplina' && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
            2. Disciplina
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

      {/* ── Passo 3: Filtros opcionais ────────────────────────────── */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
          {tipo === 'enem_completo' || tipo === 'gerar_ia' ? '3.' : '3.'} Filtros opcionais
        </h3>

        <div className={`grid gap-4 ${tipo === 'gerar_ia' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {/* Ano — oculto para IA */}
          {tipo !== 'gerar_ia' && (
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-2">
                <Clock size={12} /> Ano de referência
              </label>
              <select
                value={ano ?? ''}
                onChange={(e) => setAno(e.target.value ? Number(e.target.value) : null)}
                className="input-custom"
              >
                <option value="">Todos os anos</option>
                {ANOS.filter(Boolean).map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          )}

          {/* Nível */}
          <div>
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
                      ? tipo === 'gerar_ia'
                        ? 'bg-violet-600 text-white border-transparent'
                        : 'gradient-brand text-white border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quantidade */}
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-2">
            <Hash size={12} />
            Quantidade de questões:{' '}
            <span className={`font-bold ml-1 ${tipo === 'gerar_ia' ? 'text-violet-600 dark:text-violet-400' : 'text-brand-600 dark:text-brand-400'}`}>{quantidade}</span>
            {tipo === 'enem_completo' && (
              <span className="text-slate-400"> por área ({quantidade * 4} total)</span>
            )}
            {tipo === 'gerar_ia' && (
              <span className="text-slate-400"> — geradas pela IA</span>
            )}
          </label>
          <input
            type="range"
            min={1}
            max={tipo === 'enem_completo' ? 20 : tipo === 'gerar_ia' ? 10 : 45}
            value={quantidade}
            onChange={(e) => setQtd(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${tipo === 'gerar_ia' ? '#7c3aed' : '#6366f1'} ${(quantidade / (tipo === 'enem_completo' ? 20 : tipo === 'gerar_ia' ? 10 : 45)) * 100}%, #e2e8f0 0%)`,
            }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1</span>
            <span>{tipo === 'enem_completo' ? '20 por área' : tipo === 'gerar_ia' ? '10' : '45'}</span>
          </div>
        </div>

        {/* Tempo limite */}
        <div className="mt-4">
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

      {/* ── Erro ─────────────────────────────────────────────────── */}
      {erro && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm animate-slideDown">
          ⚠️ {erro}
        </div>
      )}

      {/* ── Botão Iniciar ─────────────────────────────────────────── */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={carregando}
        onClick={handleIniciar}
        icon={!carregando && (tipo === 'gerar_ia' ? <Sparkles size={18} /> : <Zap size={18} />)}
        className={tipo === 'gerar_ia' ? 'bg-violet-600 hover:bg-violet-700 shadow-lg' : 'shadow-brand-lg glow-brand'}
      >
        {carregando
          ? tipo === 'gerar_ia' ? 'IA gerando questões...' : 'Carregando questões...'
          : tipo === 'gerar_ia' ? 'Gerar Prova com IA' : 'Iniciar Simulado'}
        {!carregando && <ChevronRight size={18} />}
      </Button>
    </div>
  );
}
