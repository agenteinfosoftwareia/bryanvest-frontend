/**
 * client.js — Instância central do Axios
 *
 * Em desenvolvimento (npm run dev):
 *   BASE_URL = '' → chamadas /api/... vão para localhost:5173
 *   O proxy do Vite redireciona para https://eduvestapi.startupinfosoftware.com.br
 *   → Sem CORS porque o browser vê tudo como mesmo origin
 *
 * Em produção (build):
 *   BASE_URL = URL completa da API (definida pela variável VITE_API_URL)
 *   A API precisa ter CORS configurado para aceitar a origem do front-end
 *
 * Interceptors:
 *  • Request: injeta JWT no header Authorization
 *  • Response: renova token automaticamente se receber 401
 */
import axios from 'axios';

// Em dev usa proxy do Vite (URL relativa), em produção usa a URL completa
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Interceptor de REQUEST ─────────────────────────────────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tokenAcesso');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de RESPONSE ────────────────────────────────────────────
// Se receber 401, tenta renovar o token automaticamente
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const resp = await axios.post(
            `${BASE_URL}/api/v1/autenticacao/renovar`,
            { refreshToken }
          );
          const { tokenAcesso, refreshToken: novoRefresh } =
            resp.data.dados ?? resp.data;

          localStorage.setItem('tokenAcesso',  tokenAcesso);
          localStorage.setItem('refreshToken', novoRefresh);
          original.headers.Authorization = `Bearer ${tokenAcesso}`;
          return client(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default client;
