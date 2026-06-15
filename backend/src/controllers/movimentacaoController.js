import dbController from '../dbController.js';
import { validateMovimentacao, buildMovimentacao, MovimentoTipos } from '../models/movimentacao.js';

function handleError(res, error, status = 500) {
  res.status(status).json({ sucesso: false, erro: error.message || String(error) });
}

function calcularNovaQuantidade(tipo, quantidadeAtual, quantidadeItem) {
  if (tipo === MovimentoTipos.ENTRADA) {
    return quantidadeAtual + quantidadeItem;
  }

  if (tipo === MovimentoTipos.VENDA) {
    return quantidadeAtual - quantidadeItem;
  }

  if (tipo === MovimentoTipos.AJUSTE) {
    return quantidadeItem;
  }

  throw new Error(`Tipo de movimentação inválido: ${tipo}`);
}

function validarEstoque(tipo, quantidadeAtual, quantidadeItem, produtoNome) {
  if (tipo === MovimentoTipos.VENDA && quantidadeAtual < quantidadeItem) {
    throw new Error(
      `Estoque insuficiente para "${produtoNome}". Disponível: ${quantidadeAtual}, solicitado: ${quantidadeItem}`,
    );
  }

  if (tipo === MovimentoTipos.AJUSTE && quantidadeItem < 0) {
    throw new Error(`Ajuste inválido para "${produtoNome}". Quantidade não pode ser negativa.`);
  }
}

export function getAllMovimentacoes(req, res) {
  try {
    const movimentacoes = dbController.getAll('movimentacoes');
    res.json({ sucesso: true, quantidade: movimentacoes.length, dados: movimentacoes });
  } catch (error) {
    handleError(res, error);
  }
}

export function getMovimentacaoById(req, res) {
  try {
    const movimentacao = dbController.getById('movimentacoes', String(req.params.id));

    if (!movimentacao) {
      return res.status(404).json({ sucesso: false, erro: `Movimentação com ID ${req.params.id} não encontrada` });
    }

    res.json({ sucesso: true, dados: movimentacao });
  } catch (error) {
    handleError(res, error);
  }
}

export function createMovimentacao(req, res) {
  try {
    const movimentacaoData = buildMovimentacao(req.body);
    const validationErrors = validateMovimentacao(movimentacaoData);

    if (validationErrors.length > 0) {
      return res.status(400).json({ sucesso: false, erros: validationErrors });
    }

    const estoqueAnterior = new Map();

    for (const item of movimentacaoData.itens) {
      const produto = dbController.getById('produtos', item.produtoId);

      if (!produto) {
        return res.status(404).json({
          sucesso: false,
          erro: `Produto com ID ${item.produtoId} não encontrado`,
        });
      }

      try {
        validarEstoque(movimentacaoData.tipo, produto.quantidadeAtual, item.quantidade, produto.nome);
      } catch (error) {
        return res.status(400).json({ sucesso: false, erro: error.message });
      }

      estoqueAnterior.set(produto.id, produto.quantidadeAtual);
    }

    try {
      for (const item of movimentacaoData.itens) {
        const produto = dbController.getById('produtos', item.produtoId);
        const novaQuantidade = calcularNovaQuantidade(
          movimentacaoData.tipo,
          produto.quantidadeAtual,
          item.quantidade,
        );

        dbController.update('produtos', produto.id, { quantidadeAtual: novaQuantidade });
      }
    } catch (error) {
      for (const [produtoId, quantidade] of estoqueAnterior.entries()) {
        dbController.update('produtos', produtoId, { quantidadeAtual: quantidade });
      }
      throw error;
    }

    const novaMovimentacao = dbController.insert('movimentacoes', movimentacaoData);
    res.status(201).json({ sucesso: true, mensagem: 'Movimentação criada com sucesso', dados: novaMovimentacao });
  } catch (error) {
    handleError(res, error);
  }
}
