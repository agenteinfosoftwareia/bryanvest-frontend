/**
 * simulados.js — Funções para geração de simulados
 *
 * Três modos disponíveis:
 *  1. ENEM Completo  → 4 áreas × N questões
 *  2. Por Área       → filtra por área de conhecimento
 *  3. Por Disciplina → filtra por matéria específica
 */
import client from './client';

/**
 * Gera simulado ENEM completo (4 áreas)
 * GET /api/v1/simulados/enem-completo
 * @param {Object} params
 * @param {number?}  params.ano              - Ano de referência (2009-2024)
 * @param {string?}  params.nivel            - 'facil' | 'medio' | 'dificil'
 * @param {number}   params.quantidadePorArea - Questões por área (1-90, padrão 10)
 */
export async function gerarEnemCompleto({ ano, nivel, quantidadePorArea = 10 } = {}) {
  const params = { quantidadePorArea };
  if (ano)   params.ano   = ano;
  if (nivel) params.nivel = nivel;

  const resp = await client.get('/api/v1/simulados/enem-completo', { params });
  // A API retorna { sucesso: true, dados: { tipo, questoes, ... } }
  return resp.data.dados;
}

/**
 * Gera simulado por área de conhecimento
 * GET /api/v1/simulados/por-area
 * @param {Object} params
 * @param {string}  params.area       - 'linguagens' | 'ciencias_humanas' | etc.
 * @param {number?} params.ano
 * @param {string?} params.nivel
 * @param {number}  params.quantidade - Padrão 10
 */
export async function gerarPorArea({ area, ano, nivel, quantidade = 10 } = {}) {
  const params = { area, quantidade };
  if (ano)   params.ano   = ano;
  if (nivel) params.nivel = nivel;

  const resp = await client.get('/api/v1/simulados/por-area', { params });
  return resp.data.dados;
}

/**
 * Gera simulado por disciplina
 * GET /api/v1/simulados/por-disciplina
 * @param {Object} params
 * @param {string}  params.disciplina - 'matematica' | 'biologia' | etc.
 * @param {number?} params.ano
 * @param {string?} params.nivel
 * @param {number}  params.quantidade - Padrão 10
 */
export async function gerarPorDisciplina({ disciplina, ano, nivel, quantidade = 10 } = {}) {
  const params = { disciplina, quantidade };
  if (ano)   params.ano   = ano;
  if (nivel) params.nivel = nivel;

  const resp = await client.get('/api/v1/simulados/por-disciplina', { params });
  return resp.data.dados;
}
