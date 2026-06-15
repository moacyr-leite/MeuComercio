import { useState } from 'react'
import './styles/App.css'
import SideMenu from './components/SideMenu'
import DashboardPage from './pages/DashboardPage'
import EstoquePage from './pages/EstoquePage'
import CaixaPage from './pages/CaixaPage'
import RelatoriosPage from './pages/RelatoriosPage'

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pages = [
    { id: 'dashboard', label: 'Dashboard', icon: '📑', component: DashboardPage },
    { id: 'estoque', label: 'Estoque', icon: '📦', component: EstoquePage },
    { id: 'caixa', label: 'Caixa', icon: '🛒', component: CaixaPage },
    { id: 'relatorios', label: 'Relatórios', icon: '📊', component: RelatoriosPage },
  ];

  const currentPage = pages.find((page) => page.id === activePage) || pages[0];
  const ActivePage = currentPage.component;

  return (
    <div className="app-shell">
      <main className="page-content">
        <header className="page-header">
          <div>
            <p className="page-badge">{currentPage.label}</p>
            <h1>MeuComercio</h1>
          </div>
          <button
            type="button"
            className="menu-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Abrir configurações"
          >
            ☰
          </button>
        </header>
        <ActivePage />
      </main>

      <nav className="bottom-nav" aria-label="Navegação principal">
        {pages.map((page) => (
          <button
            key={page.id}
            className={`nav-button ${activePage === page.id ? 'active' : ''}`}
            onClick={() => setActivePage(page.id)}
          >
            <span className="nav-icon">{page.icon}</span>
          </button>
        ))}
      </nav>

      <SideMenu open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {settingsOpen && <div className="side-menu-backdrop" onClick={() => setSettingsOpen(false)} />}
    </div>
  );
}

export default App;
