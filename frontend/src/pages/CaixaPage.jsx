import { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import ScanCode from '../components/ScanCode'
import PagePane from './PagePane'
import { createMovimentacao, getMovimentacoes, getProdutos } from '../services/api.js'

const CART_STORAGE_KEY = 'meucomercio:caixaCarrinho';

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

function readStoredCarrinho() {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCarrinho(carrinho) {
  try {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrinho));
  } catch {
    // ignore quota / private mode
  }
}

export function clearStoredCarrinho() {
  try {
    sessionStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function CaixaPage({ isActive = true }) {
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState(readStoredCarrinho);
  const [submitting, setSubmitting] = useState(false);
  const [vendaError, setVendaError] = useState(null);
  const [vendaSuccess, setVendaSuccess] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

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

  useEffect(() => {
    persistCarrinho(carrinho);
  }, [carrinho]);

  useEffect(() => {
    if (!isActive) {
      setIsScanning(false);
    }
  }, [isActive]);

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

  const totalCarrinho = useMemo(
    () => carrinho.reduce((total, item) => total + item.quantidade * item.precoUnitario, 0),
    [carrinho],
  );

  const historicoRecente = useMemo(
    () =>
      [...movimentacoes]
        .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
        .slice(0, 5),
    [movimentacoes],
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

  function handleCodeDetected(code) {
    const codigo = String(code || '').trim();
    if (!codigo) return;

    const exato = produtos.find((produto) => produto.codigoBarras === codigo);
    if (exato) {
      adicionarAoCarrinho(exato);
      return;
    }

    setBusca(codigo);
    setVendaError(`Produto não encontrado para o código "${codigo}".`);
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
      clearStoredCarrinho();
      setVendaSuccess(`Venda confirmada: ${formatCurrency(totalVendido)}`);
      await loadData();
    } catch (err) {
      setVendaError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PagePane>
      <div className="toolbar">
        <div className="barcode-input-wrapper">
          <input
            className="search-input"
            type="search"
            placeholder="Buscar por nome ou código..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            aria-label="Buscar produtos para o caixa"
          />
          <button
            type="button"
            className="barcode-scan-button"
            onClick={() => setIsScanning((prev) => !prev)}
            aria-label={isScanning ? 'Fechar leitor de código' : 'Ler código de barras'}
          >
            📷
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="barcode-scan-panel">
          <p className="barcode-scan-help">
            Aponte a câmera para o código. Para o mesmo item de novo, afaste e aproxime outra vez.
          </p>
          <ScanCode onCodeDetected={handleCodeDetected} />
          <button type="button" className="secondary-button" onClick={() => setIsScanning(false)}>
            Fechar leitura
          </button>
        </div>
      )}

      {loading && <p className="status-message">Carregando caixa...</p>}
      {error && <p className="error-message">Erro: {error}</p>}

      {!loading && !error && (
        <>
          <div className="section-row">
            <Card
              title="Vendas hoje"
              subtitle={formatCurrency(totalVendasHoje)}
              description={`${movimentacoesHoje.filter((mov) => mov.tipo === 'VENDA').length} venda(s)`}
              imageLabel="V"
            />
            <Card
              title="Itens no carrinho"
              subtitle={`${carrinho.reduce((total, item) => total + item.quantidade, 0)} unid.`}
              description={formatCurrency(totalCarrinho)}
              imageLabel="🛒"
            />
          </div>

          {busca.trim() && (
            <>
              <h2 className="section-title">Resultados</h2>
              {produtosFiltrados.length === 0 ? (
                <p className="status-message">Nenhum produto encontrado para esta busca.</p>
              ) : (
                produtosFiltrados.map((produto) => (
                  <Card
                    key={produto.id}
                    title={produto.nome}
                    subtitle={`Cód. ${produto.codigoBarras}`}
                    value={formatCurrency(produto.precoVenda)}
                    description={`${produto.quantidadeAtual} unid. em estoque`}
                    imageLabel={produto.nome?.slice(0, 2).toUpperCase()}
                    actions={
                      <button type="button" className="text-button" onClick={() => adicionarAoCarrinho(produto)}>
                        Adicionar
                      </button>
                    }
                  />
                ))
              )}
            </>
          )}

          <h2 className="section-title">Carrinho</h2>
          {vendaError && <p className="error-message">{vendaError}</p>}
          {vendaSuccess && <p className="success-message">{vendaSuccess}</p>}

          {carrinho.length === 0 ? (
            <p className="status-message">Nenhum item no carrinho. Busque ou leia um código para começar.</p>
          ) : (
            <>
              <div className="cart-list">
                {carrinho.map((item) => (
                  <div className="cart-item" key={item.produtoId}>
                    <div className="cart-item-info">
                      <strong>{item.nome}</strong>
                      <span>
                        {item.quantidade} × {formatCurrency(item.precoUnitario)} ={' '}
                        {formatCurrency(item.quantidade * item.precoUnitario)}
                      </span>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-qty-controls">
                        <button
                          type="button"
                          className="cart-qty-button"
                          onClick={() => alterarQuantidade(item.produtoId, -1)}
                          aria-label={`Diminuir ${item.nome}`}
                        >
                          −
                        </button>
                        <span className="cart-qty-value">{item.quantidade}</span>
                        <button
                          type="button"
                          className="cart-qty-button"
                          onClick={() => alterarQuantidade(item.produtoId, 1)}
                          aria-label={`Aumentar ${item.nome}`}
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

              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={limparCarrinho} disabled={submitting}>
                  Limpar
                </button>
                <button type="button" className="primary-button" onClick={confirmarVenda} disabled={submitting}>
                  {submitting ? 'Confirmando...' : 'Confirmar venda'}
                </button>
              </div>
            </>
          )}

          <h2 className="section-title">Últimas movimentações</h2>
          {historicoRecente.length === 0 ? (
            <p className="status-message">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="history-list">
              {historicoRecente.map((mov) => (
                <div className="history-item" key={mov.id}>
                  <div className="history-item-header">
                    <span className={`history-badge ${mov.tipo.toLowerCase()}`}>{mov.tipo}</span>
                    <span>{formatCurrency(calcularTotalMovimentacao(mov))}</span>
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
