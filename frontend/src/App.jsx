import { useEffect, useState } from 'react'
import './styles/App.css'
import SideMenu from './components/SideMenu'
import DashboardPage from './pages/DashboardPage'
import EstoquePage from './pages/EstoquePage'
import CaixaPage from './pages/CaixaPage'
import RelatoriosPage from './pages/RelatoriosPage'
import LoginPage from './pages/LoginPage'
import { validateSession } from './services/api.js'

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [authChecking, setAuthChecking] = useState(() => Boolean(localStorage.getItem('authToken')));

  useEffect(() => {
    function handleLogout() {
      setUsuario(null);
    }

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setAuthChecking(false);
      return;
    }

    validateSession()
      .then((response) => {
        if (response?.usuario) {
          setUsuario(response.usuario);
          localStorage.setItem('authUser', JSON.stringify(response.usuario));
        }
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setUsuario(null);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  const pages = [
    { id: 'dashboard', label: 'Dashboard', icon: '📑', component: DashboardPage },
    { id: 'estoque', label: 'Estoque', icon: '📦', component: EstoquePage },
    { id: 'caixa', label: 'Caixa', icon: '🛒', component: CaixaPage },
    { id: 'relatorios', label: 'Relatórios', icon: '📊', component: RelatoriosPage },
  ];

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUsuario(null);
    setSettingsOpen(false);
  }

  if (authChecking) {
    return (
      <div className="login-page">
        <p className="status-message">Verificando sessão...</p>
      </div>
    );
  }

  if (!usuario) {
    return <LoginPage onLoginSuccess={setUsuario} />;
  }

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

      <SideMenu
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        usuario={usuario}
        onLogout={handleLogout}
      />
      {settingsOpen && <div className="side-menu-backdrop" onClick={() => setSettingsOpen(false)} />}
    </div>
  );
}

export default App
