import dbController from '../dbController.js';
import { validateProduto, buildProduto } from '../models/produto.js';

function formatId(id) {
  return String(id);
}

function handleError(res, error, status = 500) {
  res.status(status).json({ sucesso: false, erro: error.message || String(error) });
}

function codigoBarrasEmUso(codigoBarras, excludeId = null) {
  const produtos = dbController.getAll('produtos');
  return produtos.some(
    (produto) =>
      produto.codigoBarras === String(codigoBarras) && String(produto.id) !== String(excludeId),
  );
}

export function getAllProdutos(req, res) {
  try {
    const produtos = dbController.getAll('produtos');
    res.json({ sucesso: true, quantidade: produtos.length, dados: produtos });
  } catch (error) {
    handleError(res, error);
  }
}

export function getProdutoById(req, res) {
  try {
    const produto = dbController.getById('produtos', formatId(req.params.id));

    if (!produto) {
      return res.status(404).json({ sucesso: false, erro: `Produto com ID ${req.params.id} não encontrado` });
    }

    res.json({ sucesso: true, dados: produto });
  } catch (error) {
    handleError(res, error);
  }
}

export function createProduto(req, res) {
  try {
    const produtoData = buildProduto(req.body);
    const validationErrors = validateProduto(produtoData);

    if (validationErrors.length > 0) {
      return res.status(400).json({ sucesso: false, erros: validationErrors });
    }

    if (codigoBarrasEmUso(produtoData.codigoBarras)) {
      return res.status(400).json({ sucesso: false, erro: 'Código de barras já cadastrado' });
    }

    const novoProduto = dbController.insert('produtos', produtoData);
    res.status(201).json({ sucesso: true, mensagem: 'Produto criado com sucesso', dados: novoProduto });
  } catch (error) {
    handleError(res, error);
  }
}

export function updateProduto(req, res) {
  try {
    const id = formatId(req.params.id);
    const produtoExistente = dbController.getById('produtos', id);

    if (!produtoExistente) {
      return res.status(404).json({ sucesso: false, erro: `Produto com ID ${id} não encontrado` });
    }

    const dadosAtualizacao = {};
    const { codigoBarras, nome, quantidadeAtual, precoCompra, precoVenda } = req.body;

    if (codigoBarras !== undefined) dadosAtualizacao.codigoBarras = String(codigoBarras);
    if (nome !== undefined) dadosAtualizacao.nome = String(nome);
    if (quantidadeAtual !== undefined) dadosAtualizacao.quantidadeAtual = Number(quantidadeAtual);
    if (precoCompra !== undefined) dadosAtualizacao.precoCompra = Number(precoCompra);
    if (precoVenda !== undefined) dadosAtualizacao.precoVenda = Number(precoVenda);

    const produtoMesclado = buildProduto({ ...produtoExistente, ...dadosAtualizacao });
    const validationErrors = validateProduto(produtoMesclado);

    if (validationErrors.length > 0) {
      return res.status(400).json({ sucesso: false, erros: validationErrors });
    }

    if (dadosAtualizacao.codigoBarras && codigoBarrasEmUso(dadosAtualizacao.codigoBarras, id)) {
      return res.status(400).json({ sucesso: false, erro: 'Código de barras já cadastrado' });
    }

    const produtoAtualizado = dbController.update('produtos', id, dadosAtualizacao);
    res.json({ sucesso: true, mensagem: 'Produto atualizado com sucesso', dados: produtoAtualizado });
  } catch (error) {
    handleError(res, error);
  }
}

export function deleteProduto(req, res) {
  try {
    const id = formatId(req.params.id);
    const produtoExistente = dbController.getById('produtos', id);

    if (!produtoExistente) {
      return res.status(404).json({ sucesso: false, erro: `Produto com ID ${id} não encontrado` });
    }

    const produtoDeletado = dbController.delete('produtos', id);
    res.json({ sucesso: true, mensagem: 'Produto deletado com sucesso', dados: produtoDeletado });
  } catch (error) {
    handleError(res, error);
  }
}
