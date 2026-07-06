import { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import BarcodeInput from '../components/BarcodeInput'
import ProdutoForm from '../components/ProdutoForm'
import PagePane from './PagePane'
import {
  createMovimentacao,
  createProduto,
  deleteProduto,
  getProdutos,
  updateProduto,
} from '../services/api.js'

const EMPTY_ENTRADA = { produtoId: '', produtoSearch: '', quantidade: '', precoUnitario: '' };
const EMPTY_AJUSTE = { produtoId: '', produtoSearch: '', quantidade: '' };

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getProdutosCompatíveis(produtos, termo) {
  const valor = termo?.trim().toLowerCase();
  if (!valor) return [];

  return produtos.filter((produto) => {
    const nome = produto.nome?.toLowerCase() || '';
    const codigo = produto.codigoBarras?.toLowerCase() || '';
    return nome.includes(valor) || codigo.includes(valor) || codigo === valor;
  });
}

function EstoquePage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [entradaForm, setEntradaForm] = useState(EMPTY_ENTRADA);
  const [entradaError, setEntradaError] = useState(null);
  const [entradaSubmitting, setEntradaSubmitting] = useState(false);
  const [ajusteForm, setAjusteForm] = useState(EMPTY_AJUSTE);
  const [ajusteError, setAjusteError] = useState(null);
  const [ajusteSubmitting, setAjusteSubmitting] = useState(false);

  const loadProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProdutos();
      setProdutos(response.dados || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return produtos;

    return produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(termo) ||
        produto.codigoBarras.toLowerCase().includes(termo),
    );
  }, [busca, produtos]);

  function openCreateModal() {
    setSelectedProduto(null);
    setFormError(null);
    setModalMode('produto');
  }

  function openEditModal(produto) {
    setSelectedProduto(produto);
    setFormError(null);
    setModalMode('produto');
  }

  function openEntradaModal() {
    setEntradaForm(EMPTY_ENTRADA);
    setEntradaError(null);
    setModalMode('entrada');
  }

  function openAjusteModal() {
    setAjusteForm(EMPTY_AJUSTE);
    setAjusteError(null);
    setModalMode('ajuste');
  }

  function handleProdutoSearchChange(setter, value) {
    setter((prev) => ({
      ...prev,
      produtoSearch: value,
      produtoId: '',
    }));
  }

  function handleProdutoSelection(setter, produto) {
    setter((prev) => ({
      ...prev,
      produtoId: produto.id,
      produtoSearch: produto.nome,
    }));
  }

  function closeModal() {
    setModalMode(null);
    setSelectedProduto(null);
    setFormError(null);
    setEntradaError(null);
    setEntradaForm(EMPTY_ENTRADA);
    setAjusteError(null);
    setAjusteForm(EMPTY_AJUSTE);
  }

  async function handleSaveProduto(data) {
    setSubmitting(true);
    setFormError(null);

    try {
      if (selectedProduto) {
        await updateProduto(selectedProduto.id, data);
      } else {
        await createProduto(data);
      }
      closeModal();
      await loadProdutos();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(produto) {
    const confirmacao = window.confirm(`Excluir "${produto.nome}"?`);
    if (!confirmacao) return;

    try {
      await deleteProduto(produto.id);
      await loadProdutos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEntradaSubmit(event) {
    event.preventDefault();
    setEntradaSubmitting(true);
    setEntradaError(null);

    const produto = produtos.find((item) => item.id === entradaForm.produtoId);
    if (!produto) {
      setEntradaError('Selecione um produto válido.');
      setEntradaSubmitting(false);
      return;
    }

    try {
      await createMovimentacao({
        tipo: 'ENTRADA',
        dataHora: new Date().toISOString(),
        itens: [
          {
            produtoId: produto.id,
            quantidade: Number(entradaForm.quantidade),
            precoUnitario: Number(entradaForm.precoUnitario),
          },
        ],
      });
      closeModal();
      await loadProdutos();
    } catch (err) {
      setEntradaError(err.message);
    } finally {
      setEntradaSubmitting(false);
    }
  }

  async function handleAjusteSubmit(event) {
    event.preventDefault();
    setAjusteSubmitting(true);
    setAjusteError(null);

    const produto = produtos.find((item) => item.id === ajusteForm.produtoId);
    if (!produto) {
      setAjusteError('Selecione um produto válido.');
      setAjusteSubmitting(false);
      return;
    }

    const novaQuantidade = Number(ajusteForm.quantidade);
    if (Number.isNaN(novaQuantidade) || novaQuantidade < 0) {
      setAjusteError('Informe uma quantidade válida (0 ou mais).');
      setAjusteSubmitting(false);
      return;
    }

    try {
      await createMovimentacao({
        tipo: 'AJUSTE',
        dataHora: new Date().toISOString(),
        itens: [
          {
            produtoId: produto.id,
            quantidade: novaQuantidade,
            precoUnitario: produto.precoCompra,
          },
        ],
      });
      closeModal();
      await loadProdutos();
    } catch (err) {
      setAjusteError(err.message);
    } finally {
      setAjusteSubmitting(false);
    }
  }

  const produtoFormInitial = selectedProduto
    ? {
        codigoBarras: selectedProduto.codigoBarras,
        nome: selectedProduto.nome,
        quantidadeAtual: String(selectedProduto.quantidadeAtual),
        precoCompra: String(selectedProduto.precoCompra),
        precoVenda: String(selectedProduto.precoVenda),
      }
    : null;

  return (
    <PagePane>
      <div className="toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="Buscar por nome ou código..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          aria-label="Buscar produtos"
        />
        <div className="toolbar-actions">
          <button type="button" className="secondary-button" onClick={openEntradaModal}>
            Entrada
          </button>
          <button type="button" className="secondary-button" onClick={openAjusteModal}>
            Ajuste
          </button>
          <button type="button" className="primary-button toolbar-button" onClick={openCreateModal}>
            + Novo produto
          </button>
        </div>
      </div>

      {loading && <p className="status-message">Carregando produtos...</p>}
      {error && <p className="error-message">Erro: {error}</p>}
      {!loading && !error && produtosFiltrados.length === 0 && (
        <p className="status-message">
          {busca ? 'Nenhum produto encontrado para esta busca.' : 'Nenhum produto cadastrado.'}
        </p>
      )}

      {produtosFiltrados.map((produto) => (
        <Card
          key={produto.id}
          title={`Cód. ${produto.codigoBarras}`}
          subtitle={produto.nome}
          value={`${produto.quantidadeAtual} unid.`}
          description={`Venda: ${formatCurrency(produto.precoVenda)} · Compra: ${formatCurrency(produto.precoCompra)}`}
          imageLabel={produto.nome?.slice(0, 2).toUpperCase()}
          actions={
            <>
              <button type="button" className="text-button" onClick={() => openEditModal(produto)}>
                Editar
              </button>
              <button type="button" className="text-button danger" onClick={() => handleDelete(produto)}>
                Excluir
              </button>
            </>
          }
        />
      ))}

      {modalMode && (
        <>
          <div className="modal-backdrop" onClick={closeModal} />
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>
                {modalMode === 'entrada'
                  ? 'Entrada de estoque'
                  : modalMode === 'ajuste'
                    ? 'Ajustar estoque'
                    : selectedProduto
                      ? 'Editar produto'
                      : 'Novo produto'}
              </h2>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Fechar">
                ×
              </button>
            </div>

            {modalMode === 'produto' && (
              <>
                {formError && <p className="error-message">{formError}</p>}
                <ProdutoForm
                  initialData={produtoFormInitial}
                  onSubmit={handleSaveProduto}
                  onCancel={closeModal}
                  submitting={submitting}
                  submitLabel={selectedProduto ? 'Atualizar' : 'Cadastrar'}
                />
              </>
            )}

            {modalMode === 'entrada' && (
              <form className="user-form" onSubmit={handleEntradaSubmit}>
                {entradaError && <p className="error-message">{entradaError}</p>}
                <BarcodeInput
                  label="Produto"
                  value={entradaForm.produtoSearch}
                  onChange={(value) => handleProdutoSearchChange(setEntradaForm, value)}
                  onSelectSuggestion={(suggestion) => handleProdutoSelection(setEntradaForm, suggestion)}
                  suggestions={getProdutosCompatíveis(produtos, entradaForm.produtoSearch).map((produto) => ({
                    id: produto.id,
                    label: `${produto.nome} (${produto.codigoBarras})`,
                    ...produto,
                  }))}
                  emptyMessage="Nenhum produto compatível encontrado. Tente outro código ou nome."
                  required
                />
                {entradaForm.produtoId && (
                  <p className="card-text">
                    Produto selecionado: {produtos.find((produto) => produto.id === entradaForm.produtoId)?.nome}
                  </p>
                )}
                <label>
                  Quantidade
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={entradaForm.quantidade}
                    onChange={(event) =>
                      setEntradaForm((prev) => ({ ...prev, quantidade: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Preço unitário (R$)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={entradaForm.precoUnitario}
                    onChange={(event) =>
                      setEntradaForm((prev) => ({ ...prev, precoUnitario: event.target.value }))
                    }
                    required
                  />
                </label>
                <div className="form-actions">
                  <button type="button" className="secondary-button" onClick={closeModal} disabled={entradaSubmitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary-button" disabled={entradaSubmitting}>
                    {entradaSubmitting ? 'Registrando...' : 'Registrar entrada'}
                  </button>
                </div>
              </form>
            )}

            {modalMode === 'ajuste' && (
              <form className="user-form" onSubmit={handleAjusteSubmit}>
                {ajusteError && <p className="error-message">{ajusteError}</p>}
                <BarcodeInput
                  label="Produto"
                  value={ajusteForm.produtoSearch}
                  onChange={(value) => handleProdutoSearchChange(setAjusteForm, value)}
                  onSelectSuggestion={(suggestion) => handleProdutoSelection(setAjusteForm, suggestion)}
                  suggestions={getProdutosCompatíveis(produtos, ajusteForm.produtoSearch).map((produto) => ({
                    id: produto.id,
                    label: `${produto.nome} (${produto.codigoBarras})`,
                    ...produto,
                  }))}
                  emptyMessage="Nenhum produto compatível encontrado. Tente outro código ou nome."
                  required
                />
                {ajusteForm.produtoId && (
                  <p className="card-text">
                    Produto selecionado: {produtos.find((produto) => produto.id === ajusteForm.produtoId)?.nome}
                  </p>
                )}
                <label>
                  Nova quantidade
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={ajusteForm.quantidade}
                    onChange={(event) =>
                      setAjusteForm((prev) => ({ ...prev, quantidade: event.target.value }))
                    }
                    required
                  />
                </label>
                <p className="card-text">
                  Use o ajuste para corrigir diferenças de inventário. A quantidade informada será o novo estoque.
                </p>
                <div className="form-actions">
                  <button type="button" className="secondary-button" onClick={closeModal} disabled={ajusteSubmitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary-button" disabled={ajusteSubmitting}>
                    {ajusteSubmitting ? 'Ajustando...' : 'Confirmar ajuste'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </PagePane>
  );
}

export default EstoquePage;
