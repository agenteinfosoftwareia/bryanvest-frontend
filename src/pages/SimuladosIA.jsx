import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Play, Clock, Hash } from 'lucide-react';
import { listarSimuladosIA, obterSimuladoIA } from '../api/simulados';
import { useSimulado } from '../contexts/SimuladoContext';
import Card   from '../components/common/Card';
import Button from '../components/common/Button';

const TIPO_LABEL = {
  enem: 'ENEM', fuvest: 'FUVEST', unicamp: 'UNICAMP',
  unesp: 'UNESP', vestibular: 'Vestibular', concurso: 'Concurso', livre: 'Livre',
};

export default function SimuladosIA() {
  const { iniciar } = useSimulado();
  const navigate    = useNavigate();

  const [lista,      setLista]      = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refazendo,  setRefazendo]  = useState(null);
  const [erro,       setErro]       = useState(null);

  useEffect(() => {
    listarSimuladosIA()
      .then(setLista)
      .catch(() => setErro('Não foi possível carregar os simulados.'))
      .finally(() => setCarregando(false));
  }, []);

  const handleRefazer = async (id, label) => {
    setRefazendo(id);
    try {
      const dados = await obterSimuladoIA(id);
      iniciar(dados.questoes, {
        tipo:        'gerar_ia',
        geradoPorIA: true,
        label,
        tempoLimite: 0,
      });
      navigate('/simulado');
    } catch {
      setErro('Não foi possível carregar o simulado.');
    } finally {
      setRefazendo(null);
    }
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-violet-500" size={22} />
            Simulados com IA
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Provas geradas pela inteligência artificial
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/simulados-ia/novo')}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Criar novo
        </Button>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
          ⚠️ {erro}
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : lista.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <Sparkles size={48} className="text-violet-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Você ainda não criou nenhum simulado com IA.
          </p>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            className="mt-4 bg-violet-600 hover:bg-violet-700"
            onClick={() => navigate('/simulados-ia/novo')}
          >
            Criar primeiro simulado
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lista.map((s) => {
            const tipoLabel = TIPO_LABEL[s.tipo?.toLowerCase()] ?? s.tipo?.toUpperCase() ?? 'IA';
            const dataLabel = new Date(s.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
            return (
              <Card key={s.id} padding="md" className="border-2 border-violet-100 dark:border-violet-900/40 hover:border-violet-300 dark:hover:border-violet-600 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center gap-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold px-2.5 py-1 rounded-full">
                    <Sparkles size={11} /> {tipoLabel}
                  </span>
                  {s.publico && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Público</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Hash size={11} /> {s.totalQuestoes} questões</span>
                  {s.nivel && <span className="capitalize">{s.nivel}</span>}
                  <span className="flex items-center gap-1"><Clock size={11} /> {dataLabel}</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  loading={refazendo === s.id}
                  icon={<Play size={14} />}
                  onClick={() => handleRefazer(s.id, `${tipoLabel} – ${dataLabel}`)}
                  className="border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                >
                  {refazendo === s.id ? 'Carregando...' : 'Fazer simulado'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
