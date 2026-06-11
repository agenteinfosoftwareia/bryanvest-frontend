/**
 * Layout.jsx — Layout principal das páginas internas
 *
 * Estrutura:
 *  ┌─────────────────────────────────────┐
 *  │  Sidebar (esquerda, 64)             │
 *  │  ┌───────────────────────────────┐  │
 *  │  │  TopBar (topo, h-16)          │  │
 *  │  │  <Outlet> (conteúdo da rota)  │  │
 *  │  └───────────────────────────────┘  │
 *  └─────────────────────────────────────┘
 *
 * Em mobile: sidebar oculta, botão hamburger na topbar a abre.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar  from './TopBar';

export default function Layout() {
  // Controla se a sidebar está visível no mobile
  const [sidebarAberta, setSidebarAberta] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar fixa à esquerda */}
      <Sidebar
        isOpen={sidebarAberta}
        onClose={() => setSidebarAberta(false)}
      />

      {/* Área de conteúdo (ocupa o restante após a sidebar em desktop) */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Barra superior */}
        <TopBar onMenuClick={() => setSidebarAberta(true)} />

        {/* Conteúdo da rota atual */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
