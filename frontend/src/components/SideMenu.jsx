import { useState } from 'react'

function SideMenu({ open, onClose, usuario, onLogout }) {
  const [helpOpen, setHelpOpen] = useState(false);

  function handleOpenHelp() {
    setHelpOpen(true);
  }

  function handleCloseHelp() {
    setHelpOpen(false);
  }

  return (
    <>
      <div className={`side-menu ${open ? 'open' : ''}`}>
        <div className="side-menu-header">
          <strong>Configurações</strong>
          <button type="button" onClick={onClose} aria-label="Fechar menu">
            ×
          </button>
        </div>
        {usuario && (
          <p className="side-menu-user">
            {usuario.nome}
            <span>{usuario.email}</span>
          </p>
        )}
        <nav className="side-menu-list">
          <button type="button" onClick={onLogout}>
            Sair da conta
          </button>
          <button type="button" onClick={handleOpenHelp}>
            Ajuda
          </button>
        </nav>
      </div>

      {helpOpen && (
        <>
          <div className="modal-backdrop" onClick={handleCloseHelp} />
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
            <div className="modal-header">
              <h2 id="help-title">Como usar</h2>
              <button type="button" className="modal-close" onClick={handleCloseHelp} aria-label="Fechar">
                ×
              </button>
            </div>
            <ul className="help-list">
              <li>
                <strong>📦 Estoque</strong>
                <p>Cadastre produtos, registre entradas de mercadoria ou ajuste a quantidade quando fizer inventário.</p>
              </li>
              <li>
                <strong>🛒 Caixa</strong>
                <p>Busque o produto, adicione ao carrinho e confirme a venda. O estoque é atualizado automaticamente.</p>
              </li>
              <li>
                <strong>📊 Relatórios</strong>
                <p>Veja vendas, entradas e histórico de movimentações por período.</p>
              </li>
              <li>
                <strong>📑 Dashboard</strong>
                <p>Acompanhe o resumo do dia: vendas, produtos cadastrados e alertas de estoque baixo.</p>
              </li>
            </ul>
            <button type="button" className="primary-button" onClick={handleCloseHelp}>
              Entendi
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default SideMenu;
