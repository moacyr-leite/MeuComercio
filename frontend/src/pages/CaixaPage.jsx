import { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import ScanCode from '../components/ScanCode'
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
          <button></button>
          <button></button>
          <ScanCode/>
        </>
      )}
    </PagePane>
  );
}

export default CaixaPage;
