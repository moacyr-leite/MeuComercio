function SideMenu({ open, onClose }) {
  return (
    <div className={`side-menu ${open ? 'open' : ''}`}>
      <div className="side-menu-header">
        <strong>Configurações</strong>
        <button type="button" onClick={onClose} aria-label="Fechar menu">
          ×
        </button>
      </div>
      <nav className="side-menu-list">
        <button type="button">Conta</button>
        <button type="button">Notificações</button>
        <button type="button">Tema</button>
        <button type="button">Ajuda</button>
      </nav>
    </div>
  );
}

export default SideMenu;
