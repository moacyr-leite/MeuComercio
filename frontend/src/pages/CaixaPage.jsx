import { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import PagePane from './PagePane'
import { createMovimentacao, getMovimentacoes, getProdutos } from '../services/api.js'

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function isToday(dateString) {
  const date = new Date(dateString);
  const hoje = new Date();
  return (
    date.getFullYear() === hoje.getFullYear() &&
    date.getMonth() === hoje.getMonth() &&
    date.getDate() === hoje.getDate()
  );
}

function calcularTotalMovimentacao(movimentacao) {
  return movimentacao.itens.reduce(
    (total, item) => total + item.quantidade * item.precoUnitario,
    0,
  );
}

function CaixaPage() {
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [vendaError, setVendaError] = useState(null);
  const [vendaSuccess, setVendaSuccess] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [produtosResponse, movimentacoesResponse] = await Promise.all([
        getProdutos(),
        getMovimentacoes(),
      ]);
      setProdutos(produtosResponse.dados || []);
      setMovimentacoes(movimentacoesResponse.dados || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return [];

    return produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(termo) ||
        produto.codigoBarras.toLowerCase().includes(termo),
    );
  }, [busca, produtos]);

  const movimentacoesHoje = useMemo(
    () => movimentacoes.filter((mov) => isToday(mov.dataHora)),
    [movimentacoes],
  );

  const totalVendasHoje = useMemo(
    () =>
      movimentacoesHoje
        .filter((mov) => mov.tipo === 'VENDA')
        .reduce((total, mov) => total + calcularTotalMovimentacao(mov), 0),
    [movimentacoesHoje],
  );

  const totalEntradasHoje = useMemo(
    () =>
      movimentacoesHoje
        .filter((mov) => mov.tipo === 'ENTRADA')
        .reduce((total, mov) => total + calcularTotalMovimentacao(mov), 0),
    [movimentacoesHoje],
  );

  const totalCarrinho = useMemo(
    () => carrinho.reduce((total, item) => total + item.quantidade * item.precoUnitario, 0),
    [carrinho],
  );

  function adicionarAoCarrinho(produto) {
    setVendaError(null);
    setVendaSuccess(null);
    setCarrinho((prev) => {
      const existente = prev.find((item) => item.produtoId === produto.id);
      if (existente) {
        if (existente.quantidade >= produto.quantidadeAtual) {
          setVendaError(`Estoque insuficiente para "${produto.nome}".`);
          return prev;
        }
        return prev.map((item) =>
          item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item,
        );
      }

      if (produto.quantidadeAtual < 1) {
        setVendaError(`"${produto.nome}" está sem estoque.`);
        return prev;
      }

      return [
        ...prev,
        {
          produtoId: produto.id,
          nome: produto.nome,
          quantidade: 1,
          precoUnitario: produto.precoVenda,
          estoqueDisponivel: produto.quantidadeAtual,
        },
      ];
    });
    setBusca('');
  }

  function removerDoCarrinho(produtoId) {
    setCarrinho((prev) => prev.filter((item) => item.produtoId !== produtoId));
  }

  function alterarQuantidade(produtoId, delta) {
    setVendaError(null);
    setVendaSuccess(null);
    setCarrinho((prev) =>
      prev
        .map((item) => {
          if (item.produtoId !== produtoId) return item;

          const novaQuantidade = item.quantidade + delta;
          if (novaQuantidade <= 0) return null;
          if (novaQuantidade > item.estoqueDisponivel) {
            setVendaError(`Estoque insuficiente para "${item.nome}".`);
            return item;
          }
          return { ...item, quantidade: novaQuantidade };
        })
        .filter(Boolean),
    );
  }

  function limparCarrinho() {
    setCarrinho([]);
    setVendaError(null);
    setVendaSuccess(null);
  }

  async function confirmarVenda() {
    if (carrinho.length === 0) return;

    setSubmitting(true);
    setVendaError(null);
    setVendaSuccess(null);

    try {
      await createMovimentacao({
        tipo: 'VENDA',
        dataHora: new Date().toISOString(),
        itens: carrinho.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })),
      });
      const totalVendido = totalCarrinho;
      setCarrinho([]);
      setVendaSuccess(`Venda confirmada: ${formatCurrency(totalVendido)}`);
      await loadData();
    } catch (err) {
      setVendaError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const historicoRecente = useMemo(
    () =>
      [...movimentacoes]
        .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
        .slice(0, 5),
    [movimentacoes],
  );

  return (
    <PagePane>
      {loading && <p className="status-message">Carregando caixa...</p>}
      {error && <p className="error-message">Erro: {error}</p>}

      {!loading && !error && (
        <>
          <Card
            title="Caixa diário"
            subtitle={formatCurrency(totalVendasHoje)}
            description={
              totalVendasHoje > 0
                ? 'Vendas confirmadas hoje'
                : 'Nenhuma venda registrada hoje'
            }
            imageLabel="CA"
          />
          <div className="dashboard-grid">
            <Card
              title="Entrada"
              subtitle={formatCurrency(totalEntradasHoje)}
              description="Compras registradas hoje"
              imageLabel="EN"
            />
            <Card
              title="Vendas"
              subtitle={String(movimentacoesHoje.filter((mov) => mov.tipo === 'VENDA').length)}
              description="Operações de venda hoje"
              imageLabel="VD"
            />
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="Buscar produto para vender..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            aria-label="Buscar produto"
          />

          {busca && produtosFiltrados.length === 0 && (
            <p className="status-message">Nenhum produto encontrado.</p>
          )}

          {produtosFiltrados.slice(0, 5).map((produto) => (
            <button
              key={produto.id}
              type="button"
              className="secondary-button"
              onClick={() => adicionarAoCarrinho(produto)}
            >
              {produto.nome} · {formatCurrency(produto.precoVenda)} · {produto.quantidadeAtual} unid.
            </button>
          ))}

          {vendaSuccess && !carrinho.length && (
            <p className="success-message">{vendaSuccess}</p>
          )}

          {carrinho.length > 0 && (
            <>
              <h2 className="section-title">Carrinho</h2>
              <div className="cart-list">
                {carrinho.map((item) => (
                  <div key={item.produtoId} className="cart-item">
                    <div className="cart-item-info">
                      <strong>{item.nome}</strong>
                      <span>{formatCurrency(item.precoUnitario)} cada</span>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-qty-controls">
                        <button
                          type="button"
                          className="cart-qty-button"
                          onClick={() => alterarQuantidade(item.produtoId, -1)}
                          aria-label={`Diminuir quantidade de ${item.nome}`}
                        >
                          −
                        </button>
                        <span className="cart-qty-value">{item.quantidade}</span>
                        <button
                          type="button"
                          className="cart-qty-button"
                          onClick={() => alterarQuantidade(item.produtoId, 1)}
                          aria-label={`Aumentar quantidade de ${item.nome}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-button danger"
                        onClick={() => removerDoCarrinho(item.produtoId)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>Total</span>
                <span>{formatCurrency(totalCarrinho)}</span>
              </div>
              {vendaError && <p className="error-message">{vendaError}</p>}
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={limparCarrinho} disabled={submitting}>
                  Limpar carrinho
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={confirmarVenda}
                  disabled={submitting}
                >
                  {submitting ? 'Confirmando...' : 'Confirmar venda'}
                </button>
              </div>
            </>
          )}

          <h2 className="section-title">Histórico recente</h2>
          {historicoRecente.length === 0 ? (
            <p className="status-message">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="history-list">
              {historicoRecente.map((mov) => (
                <div key={mov.id} className="history-item">
                  <div className="history-item-header">
                    <span className={`history-badge ${mov.tipo.toLowerCase()}`}>{mov.tipo}</span>
                    <strong>{formatCurrency(calcularTotalMovimentacao(mov))}</strong>
                  </div>
                  <p className="card-text">
                    {new Date(mov.dataHora).toLocaleString('pt-BR')} · {mov.itens.length} item(ns)
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PagePane>
  );
}

export default CaixaPage;
