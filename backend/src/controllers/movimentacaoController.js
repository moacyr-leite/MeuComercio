import dbController from '../dbController.js';
import { validateMovimentacao, buildMovimentacao } from '../models/movimentacao.js';

function handleError(res, error, status = 500) {
  res.status(status).json({ sucesso: false, erro: error.message || String(error) });
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

    const novaMovimentacao = dbController.insert('movimentacoes', movimentacaoData);
    res.status(201).json({ sucesso: true, mensagem: 'Movimentação criada com sucesso', dados: novaMovimentacao });
  } catch (error) {
    handleError(res, error);
  }
}
