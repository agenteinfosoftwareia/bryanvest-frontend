/**
 * auth.js — Funções de autenticação
 *
 * Encapsula as chamadas de:
 *  • Login com e-mail e senha
 *  • Cadastro de novo usuário
 *  • Logout (revoga refresh token)
 */
import client from './client';

/**
 * Login com e-mail e senha
 * POST /api/v1/autenticacao/entrar
 * @param {string} email
 * @param {string} senha
 * @returns {Object} { tokenAcesso, refreshToken, usuario }
 */
export async function login(email, senha) {
  const resp = await client.post('/api/v1/autenticacao/entrar', { email, senha });
  return resp.data;
}

/**
 * Cadastro de novo usuário
 * POST /api/v1/usuarios
 * Não requer autenticação — endpoint público
 * @param {Object} dados - { nome, email, senha, confirmacaoSenha }
 * @returns {Object} dados do usuário criado
 */
export async function cadastrar(dados) {
  const resp = await client.post('/api/v1/usuarios', dados);
  return resp.data;
}

/**
 * Login com Google — envia o idToken recebido do Google Sign-In
 * POST /api/v1/autenticacao/google
 * @param {string} idToken - token JWT emitido pelo Google
 * @returns {Object} { tokenAcesso, refreshToken, usuario }
 */
export async function loginGoogle(idToken) {
  const resp = await client.post('/api/v1/autenticacao/google', { idToken });
  return resp.data;
}

/**
 * Logout — revoga o refreshToken no servidor
 * POST /api/v1/autenticacao/sair
 * @param {string} refreshToken
 */
export async function logout(refreshToken) {
  try {
    await client.post('/api/v1/autenticacao/sair', { refreshToken });
  } catch {
    // Ignora erro no logout (token pode já estar inválido)
  }
}
