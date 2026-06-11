/**
 * SimuladoContext.jsx — Contexto do simulado em andamento
 *
 * Funcionalidades:
 *  • Embaralha alternativas a cada início (Fisher-Yates) para evitar memorização
 *  • Cronômetro total regressivo (configurável, zera → finaliza automaticamente)
 *  • Cronômetro por questão (conta o tempo gasto em cada pergunta)
 *  • Respostas reveladas SOMENTE após finalizar — durante o simulado
 *    o aluno vê apenas qual alternativa escolheu, sem cor de certo/errado
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const SimuladoContext = createContext(null);

// ─── Fisher-Yates shuffle ─────────────────────────────────────────────────
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Embaralha alternativas de uma questão ────────────────────────────────
function embaralharAlternativas(questao) {
  const LETRAS = ['a', 'b', 'c', 'd', 'e'];
  const originais = [
    { letra: 'a', texto: questao.alternativaA },
    { letra: 'b', texto: questao.alternativaB },
    { letra: 'c', texto: questao.alternativaC },
    { letra: 'd', texto: questao.alternativaD },
    { letra: 'e', texto: questao.alternativaE },
  ].filter((alt) => alt.texto?.trim());

  const embaralhadas = shuffle(originais);

  const mapeamento = {};
  embaralhadas.forEach((alt, idx) => { mapeamento[LETRAS[idx]] = alt.letra; });

  const corretaOriginal = questao.respostaCorreta?.toLowerCase();
  const novaCorreta = LETRAS.find((l) => mapeamento[l] === corretaOriginal) ?? corretaOriginal;

  return {
    ...questao,
    _alternativas:    embaralhadas.map((alt, idx) => ({
      letra:    LETRAS[idx],
      texto:    alt.texto,
      original: alt.letra,
    })),
    _respostaCorreta: novaCorreta,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────
export function SimuladoProvider({ children }) {
  // Questões com alternativas embaralhadas
  const [questoes,    setQuestoes]    = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  // { questaoId: 'b' }
  const [respostas,   setRespostas]   = useState({});
  // acertos (calculados só no resultado)
  const [pontos,      setPontos]      = useState(0);
  const [finalizado,  setFinalizado]  = useState(false);
  const [config,      setConfig]      = useState(null);
  const [carregando,  setCarregando]  = useState(false);
  const [erro,        setErro]        = useState(null);

  // ── Cronômetro total regressivo ─────────────────────────────────────────
  const [tempoTotal,    setTempoTotal]    = useState(0);    // segundos configurados
  const [tempoRestante, setTempoRestante] = useState(0);    // contagem regressiva
  const [timerAtivo,    setTimerAtivo]    = useState(false);
  const timerRef = useRef(null);

  // ── Cronômetro por questão (crescente) ──────────────────────────────────
  // { questaoId: segundos gastos }
  const [tempoPorQuestao, setTempoPorQuestao] = useState({});
  const [tempoQuestaoAtual, setTempoQuestaoAtual] = useState(0);
  const questaoTimerRef  = useRef(null);
  const inicioQuestaoRef = useRef(null);

  // ── Iniciar timer geral ─────────────────────────────────────────────────
  useEffect(() => {
    if (!timerAtivo || finalizado) return;

    timerRef.current = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          // Tempo esgotado → finaliza automaticamente
          clearInterval(timerRef.current);
          setTimerAtivo(false);
          setFinalizado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timerAtivo, finalizado]);

  // ── Timer por questão ───────────────────────────────────────────────────
  // Reinicia sempre que o índice da questão muda
  useEffect(() => {
    // Salva tempo da questão anterior
    if (questoes.length > 0) {
      const questaoAnteriorId = questoes[indiceAtual]?.id;
      // Reinicia contador
      setTempoQuestaoAtual(0);
      inicioQuestaoRef.current = Date.now();
    }

    // Intervalo de 1s para atualizar o display em tempo real
    questaoTimerRef.current = setInterval(() => {
      if (inicioQuestaoRef.current) {
        const elapsed = Math.floor((Date.now() - inicioQuestaoRef.current) / 1000);
        setTempoQuestaoAtual(elapsed);
      }
    }, 1000);

    return () => clearInterval(questaoTimerRef.current);
  }, [indiceAtual, questoes.length]);

  // ── Salva tempo da questão ao responder ─────────────────────────────────
  const salvarTempoDaQuestao = useCallback((questaoId) => {
    if (!inicioQuestaoRef.current) return;
    const gasto = Math.floor((Date.now() - inicioQuestaoRef.current) / 1000);
    setTempoPorQuestao((prev) => ({ ...prev, [questaoId]: gasto }));
  }, []);

  // ── Iniciar simulado ────────────────────────────────────────────────────
  const iniciar = useCallback((questoesBrutas, configuracao) => {
    const comEmbaralho = questoesBrutas.map(embaralharAlternativas);

    setQuestoes(comEmbaralho);
    setIndiceAtual(0);
    setRespostas({});
    setPontos(0);
    setFinalizado(false);
    setConfig(configuracao);
    setErro(null);
    setTempoPorQuestao({});
    setTempoQuestaoAtual(0);
    inicioQuestaoRef.current = Date.now();

    // Configura e inicia o cronômetro total (0 = sem limite)
    const segundos = configuracao.tempoLimite ?? 0;
    setTempoTotal(segundos);
    setTempoRestante(segundos);
    setTimerAtivo(segundos > 0);
  }, []);

  // ── Responder questão ───────────────────────────────────────────────────
  // Não revela certo/errado aqui — só registra a resposta
  const responder = useCallback((questaoId, alternativa) => {
    if (respostas[questaoId]) return; // não permite trocar

    salvarTempoDaQuestao(questaoId);
    setRespostas((prev) => ({ ...prev, [questaoId]: alternativa }));
  }, [respostas, salvarTempoDaQuestao]);

  // ── Finalizar (calcula pontos) ──────────────────────────────────────────
  // Os acertos são calculados APENAS ao finalizar
  const finalizar = useCallback(() => {
    // Para os timers
    clearInterval(timerRef.current);
    clearInterval(questaoTimerRef.current);
    setTimerAtivo(false);

    // Salva tempo da última questão ainda não registrada
    const ultimaId = questoes[indiceAtual]?.id;
    if (ultimaId && !tempoPorQuestao[ultimaId]) {
      salvarTempoDaQuestao(ultimaId);
    }

    // Calcula acertos
    let acertos = 0;
    questoes.forEach((q) => {
      if (respostas[q.id]?.toLowerCase() === q._respostaCorreta?.toLowerCase()) {
        acertos++;
      }
    });
    setPontos(acertos);
    setFinalizado(true);
  }, [questoes, respostas, indiceAtual, tempoPorQuestao, salvarTempoDaQuestao]);

  // ── Navegação ───────────────────────────────────────────────────────────
  const avancar = useCallback(() => {
    if (indiceAtual < questoes.length - 1) {
      setIndiceAtual((prev) => prev + 1);
    } else {
      finalizar();
    }
  }, [indiceAtual, questoes.length, finalizar]);

  const retroceder = useCallback(() => {
    if (indiceAtual > 0) setIndiceAtual((prev) => prev - 1);
  }, [indiceAtual]);

  // ── Resetar ─────────────────────────────────────────────────────────────
  const resetar = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(questaoTimerRef.current);
    setQuestoes([]);
    setIndiceAtual(0);
    setRespostas({});
    setPontos(0);
    setFinalizado(false);
    setConfig(null);
    setErro(null);
    setTempoTotal(0);
    setTempoRestante(0);
    setTimerAtivo(false);
    setTempoPorQuestao({});
    setTempoQuestaoAtual(0);
    inicioQuestaoRef.current = null;
  }, []);

  // Valores calculados
  const total        = questoes.length;
  const questaoAtual = questoes[indiceAtual] ?? null;
  const progresso    = total > 0 ? Math.round(((indiceAtual + 1) / total) * 100) : 0;
  const percentual   = total > 0 ? Math.round((pontos / total) * 100) : 0;
  const respondidas  = Object.keys(respostas).length;

  return (
    <SimuladoContext.Provider value={{
      // Estado
      questoes, indiceAtual, respostas, pontos, finalizado, config, carregando, erro,
      // Timer total
      tempoTotal, tempoRestante, timerAtivo,
      // Timer por questão
      tempoPorQuestao, tempoQuestaoAtual,
      // Calculados
      total, questaoAtual, progresso, percentual, respondidas,
      // Ações
      iniciar, responder, avancar, retroceder, resetar, finalizar,
      setCarregando, setErro,
    }}>
      {children}
    </SimuladoContext.Provider>
  );
}

export function useSimulado() {
  const ctx = useContext(SimuladoContext);
  if (!ctx) throw new Error('useSimulado deve ser usado dentro de <SimuladoProvider>');
  return ctx;
}
