import dbController from '../dbController.js';
import { MovimentoTipos } from '../models/movimentacao.js';

const ESTOQUE_BAIXO_LIMITE = 5;

function handleError(res, error, status = 500) {
  res.status(status).json({ sucesso: false, erro: error.message || String(error) });
}

function calcularTotalMovimentacao(movimentacao) {
  return movimentacao.itens.reduce(
    (total, item) => total + item.quantidade * item.precoUnitario,
    0,
  );
}

function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isSameMonth(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();
}

export function getResumo(req, res) {
  try {
    const produtos = dbController.getAll('produtos');
    const movimentacoes = dbController.getAll('movimentacoes');
    const hoje = new Date();

    const vendas = movimentacoes.filter((mov) => mov.tipo === MovimentoTipos.VENDA);
    const entradas = movimentacoes.filter((mov) => mov.tipo === MovimentoTipos.ENTRADA);

    const vendasHoje = vendas.filter((mov) => isSameDay(new Date(mov.dataHora), hoje));
    const vendasMes = vendas.filter((mov) => isSameMonth(new Date(mov.dataHora), hoje));
    const entradasHoje = entradas.filter((mov) => isSameDay(new Date(mov.dataHora), hoje));

    const totalVendasHoje = vendasHoje.reduce((total, mov) => total + calcularTotalMovimentacao(mov), 0);
    const totalVendasMes = vendasMes.reduce((total, mov) => total + calcularTotalMovimentacao(mov), 0);
    const totalEntradasHoje = entradasHoje.reduce((total, mov) => total + calcularTotalMovimentacao(mov), 0);

    const produtosEstoqueBaixo = produtos
      .filter((produto) => produto.quantidadeAtual < ESTOQUE_BAIXO_LIMITE)
      .map((produto) => ({
        id: produto.id,
        nome: produto.nome,
        quantidadeAtual: produto.quantidadeAtual,
      }));

    res.json({
      sucesso: true,
      dados: {
        totalProdutos: produtos.length,
        vendasHoje: {
          quantidade: vendasHoje.length,
          total: totalVendasHoje,
        },
        vendasMes: {
          quantidade: vendasMes.length,
          total: totalVendasMes,
        },
        entradasHoje: {
          quantidade: entradasHoje.length,
          total: totalEntradasHoje,
        },
        produtosEstoqueBaixo,
        estoqueBaixoLimite: ESTOQUE_BAIXO_LIMITE,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
}
