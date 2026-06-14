/**
 * App.jsx — Roteamento principal da aplicação BryanVest
 *
 * Estrutura de rotas:
 *  • /login         → Login (público)
 *  • /cadastro      → Cadastro (público)
 *  • /              → Redireciona para /dashboard
 *  • /dashboard     → Dashboard com gráficos (protegido)
 *  • /simulados  → Escolher simulado (protegido)
 *  • /simulado   → Simulado em andamento (protegido)
 *  • /resultado     → Resultado do simulado (protegido)
 *  • /perfil        → Perfil do aluno (protegido)
 *
 * Rotas protegidas exigem autenticação (ProtectedRoute).
 * Rotas internas compartilham o Layout com Sidebar + TopBar.
 * SimuladoProvider envolve as rotas de simulado para manter estado.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Provedores de contexto
import { AuthProvider }     from './contexts/AuthContext';
import { ThemeProvider }    from './contexts/ThemeContext';
import { SimuladoProvider } from './contexts/SimuladoContext';

// Layout e guarda de rota
import Layout         from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Páginas públicas
import Login    from './pages/Login';
import Cadastro from './pages/Cadastro';

// Páginas internas
import Dashboard        from './pages/Dashboard';
import EscolherSimulado from './pages/EscolherSimulado';
import SimuladoAtivo    from './pages/SimuladoAtivo';
import Resultado        from './pages/Resultado';
import Perfil           from './pages/Perfil';

export default function App() {
  return (
    // ThemeProvider: dark mode global (aplica classe 'dark' no <html>)
    <ThemeProvider>
      {/* AuthProvider: gerencia JWT e dados do usuário logado */}
      <AuthProvider>
        {/* SimuladoProvider: estado do simulado em andamento */}
        <SimuladoProvider>
          <BrowserRouter>
            <Routes>
              {/* ── Rotas públicas ────────────────────────────── */}
              <Route path="/login"    element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />

              {/* ── Raiz → dashboard ──────────────────────────── */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* ── Rotas protegidas com Layout compartilhado ─── */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard"  element={<Dashboard />} />
                <Route path="/simulados"  element={<EscolherSimulado />} />
                <Route path="/simulado"   element={<SimuladoAtivo />} />
                <Route path="/resultado"       element={<Resultado />} />
                <Route path="/perfil"          element={<Perfil />} />
              </Route>

              {/* ── Rota 404 ──────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SimuladoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
