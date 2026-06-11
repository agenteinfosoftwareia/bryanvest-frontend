/**
 * vite.config.js — Configuração do Vite
 *
 * server.proxy: redireciona chamadas /api do frontend para o backend em produção.
 * Em dev, o browser faz a requisição para localhost:5173/api/... e o Vite
 * redireciona para https://eduvestapi.startupinfosoftware.com.br/api/...
 * sem precisar de CORS configurado no servidor.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Proxy: todas as chamadas /api vão para a API em produção
    proxy: {
      '/api': {
        target:       'https://eduvestapi.startupinfosoftware.com.br',
        changeOrigin: true,  // altera o header Origin para o target
        secure:       false, // aceita certificado auto-assinado
        rewrite: (path) => path, // mantém o path igual (/api/v1/...)
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
