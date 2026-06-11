/**
 * QuestionCard.jsx — Card completo de uma questão do simulado
 *
 * Exibe:
 *  • Número da questão + área/disciplina + ano + nível
 *  • Texto de apoio (se houver) em card destacado
 *  • Enunciado
 *  • 5 alternativas embaralhadas (via AlternativeButton)
 *  • Após responder: mostra explicação e dica de estudo
 *  • Botões: Próxima / Finalizar
 *
 * Props:
 *  • questao:     objeto questão (com _alternativas e _respostaCorreta já embaralhados)
 *  • numero:      número sequencial (ex: 5 de 20)
 *  • total:       total de questões
 *  • resposta:    alternativa já escolhida pelo aluno (ou undefined)
 *  • onResponder: callback(questaoId, letraEscolhida)
 *  • onAvancar:   callback para próxima questão
 *  • onRetroceder: callback para questão anterior
 *  • ultimaQuestao: boolean, true se for a última
 */
import { useState } from 'react';
import { ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import AlternativeButton from './AlternativeButton';
import Badge from '../common/Badge';
import Button from '../common/Button';

// Mapa de cor por área
const AREA_COLORS = {
  linguagens:       'blue',
  ciencias_humanas:  'yellow',
  ciencias_natureza: 'green',
  matematica:        'brand',
};

// Nomes legíveis por área
const AREA_LABELS = {
  linguagens:       'Linguagens',
  ciencias_humanas:  'Ciências Humanas',
  ciencias_natureza: 'Ciências da Natureza',
  matematica:        'Matemática',
};

const NIVEL_COLORS = { facil: 'green', medio: 'yellow', dificil: 'red' };

export default function QuestionCard({
  questao,
  numero,
  total,
  resposta,
  onResponder,
  onAvancar,
  onRetroceder,
  ultimaQuestao = false,
}) {
  // Controla se o texto de apoio está expandido
  const [apoioExpandido, setApoioExpandido] = useState(false);

  // A questão já foi respondida?
  const respondida = !!resposta;

  // Handler: usuário clicou em uma alternativa
  const handleClick = (letra) => {
    if (respondida) return; // não permite trocar após responder
    onResponder(questao.id, letra);
  };

  return (
    <div className="animate-slideUp">
      {/* ── Header da questão ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Número */}
        <span className="inline-flex items-center justify-center w-9 h-9 gradient-brand rounded-xl text-white text-sm font-bold shadow-brand-sm">
          {numero}
        </span>

        {/* Área */}
        {questao.area && (
          <Badge color={AREA_COLORS[questao.area] ?? 'gray'} dot>
            {AREA_LABELS[questao.area] ?? questao.area}
          </Badge>
        )}

        {/* Disciplina */}
        {questao.disciplina && (
          <Badge color="gray">
            {questao.disciplina.charAt(0).toUpperCase() + questao.disciplina.slice(1)}
          </Badge>
        )}

        {/* Nível */}
        {questao.nivel && (
          <Badge color={NIVEL_COLORS[questao.nivel] ?? 'gray'}>
            {questao.nivel.charAt(0).toUpperCase() + questao.nivel.slice(1)}
          </Badge>
        )}

        {/* Ano */}
        {questao.anoReferencia && (
          <Badge color="gray">{questao.anoReferencia}</Badge>
        )}

        {/* Contador direita */}
        <span className="ml-auto text-sm text-slate-400 dark:text-slate-500 font-medium">
          {numero} / {total}
        </span>
      </div>

      {/* ── Texto de apoio ────────────────────────────────────────────── */}
      {questao.textoApoio && (
        <div className="mb-4">
          <button
            onClick={() => setApoioExpandido(!apoioExpandido)}
            className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline mb-2"
          >
            <BookOpen size={14} />
            {apoioExpandido ? 'Ocultar texto de apoio' : 'Ver texto de apoio'}
          </button>

          {apoioExpandido && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-slideDown whitespace-pre-wrap">
              {questao.textoApoio}
            </div>
          )}
        </div>
      )}

      {/* ── Enunciado ─────────────────────────────────────────────────── */}
      <div className="mb-5 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <p className="text-slate-800 dark:text-slate-100 text-base leading-relaxed whitespace-pre-wrap">
          {questao.enunciado}
        </p>
      </div>

      {/* ── Alternativas embaralhadas ──────────────────────────────────── */}
      {/* revelada=false: cores de certo/errado só aparecem no Resultado */}
      <div className="space-y-2.5 mb-5">
        {(questao._alternativas ?? []).map(({ letra, texto }) => (
          <AlternativeButton
            key={letra}
            letra={letra}
            texto={texto}
            selecionada={resposta === letra}
            correta={letra === questao._respostaCorreta}
            revelada={false}
            disabled={respondida}
            onClick={() => handleClick(letra)}
          />
        ))}
      </div>

      {/* ── Aviso após responder (sem revelar certo/errado) ───────────── */}
      {respondida && (
        <div className="mb-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/40 animate-slideUp">
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium text-center">
            Resposta registrada — o resultado será revelado ao finalizar o simulado.
          </p>
        </div>
      )}

      {/* ── Navegação ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Botão anterior */}
        <Button
          variant="secondary"
          size="md"
          icon={<ChevronLeft size={16} />}
          onClick={onRetroceder}
          disabled={numero <= 1}
          className="min-w-[110px]"
        >
          Anterior
        </Button>

        {/* Botão próxima / finalizar */}
        {respondida && (
          <Button
            variant="primary"
            size="md"
            onClick={onAvancar}
            className="min-w-[140px]"
          >
            {ultimaQuestao ? 'Ver Resultado' : 'Próxima'}
            {!ultimaQuestao && <ChevronRight size={16} />}
          </Button>
        )}

        {/* Instrução quando ainda não respondeu */}
        {!respondida && (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
            Selecione uma alternativa
          </p>
        )}
      </div>
    </div>
  );
}
