/**
 * perfil.js — Funções para perfil do aluno
 *
 * O perfil do aluno contém informações escolares:
 * escola, vestibulares alvo, matérias difíceis, modo escuro, etc.
 */
import client from './client';

/**
 * Busca o perfil do aluno
 * GET /api/v1/perfil-aluno/{usuarioId}
 * @param {string} usuarioId - GUID do usuário
 */
export async function buscarPerfil(usuarioId) {
  const resp = await client.get(`/api/v1/perfil-aluno/${usuarioId}`);
  return resp.data.dados ?? resp.data;
}

/**
 * Salva ou atualiza o perfil do aluno
 * PUT /api/v1/perfil-aluno/{usuarioId}
 * @param {string} usuarioId
 * @param {Object} dados - Campos parciais do perfil
 */
export async function salvarPerfil(usuarioId, dados) {
  const resp = await client.put(`/api/v1/perfil-aluno/${usuarioId}`, dados);
  return resp.data.dados ?? resp.data;
}

/**
 * Busca as opções disponíveis para selects do perfil
 * GET /api/v1/perfil-aluno/opcoes
 * Não requer autenticação
 */
export async function buscarOpcoes() {
  const resp = await client.get('/api/v1/perfil-aluno/opcoes');
  return resp.data.dados ?? resp.data;
}

/**
 * Busca dados básicos do usuário
 * GET /api/v1/usuarios/{id}
 * @param {string} id
 */
export async function buscarUsuario(id) {
  const resp = await client.get(`/api/v1/usuarios/${id}`);
  return resp.data.dados ?? resp.data;
}

/**
 * Atualiza dados básicos do usuário (nome, email, fotoUrl)
 * PUT /api/v1/usuarios/{id}
 * @param {string} id
 * @param {Object} dados - { nome, email, fotoUrl }
 */
export async function atualizarUsuario(id, dados) {
  const resp = await client.put(`/api/v1/usuarios/${id}`, dados);
  return resp.data.dados ?? resp.data;
}
