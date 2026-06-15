/**
 * Domínio Produto
 */

export function validateProduto(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Dados do produto inválidos');
    return errors;
  }

  if (!data.codigoBarras || typeof data.codigoBarras !== 'string') {
    errors.push('codigoBarras é obrigatório e deve ser string');
  }

  if (!data.nome || typeof data.nome !== 'string') {
    errors.push('nome é obrigatório e deve ser string');
  }

  if (data.quantidadeAtual === undefined || Number.isNaN(Number(data.quantidadeAtual))) {
    errors.push('quantidadeAtual é obrigatório e deve ser número');
  }

  if (data.precoCompra === undefined || Number.isNaN(Number(data.precoCompra))) {
    errors.push('precoCompra é obrigatório e deve ser número');
  }

  if (data.precoVenda === undefined || Number.isNaN(Number(data.precoVenda))) {
    errors.push('precoVenda é obrigatório e deve ser número');
  }

  return errors;
}

export function buildProduto(data) {
  return {
    id: data.id ? String(data.id) : undefined,
    codigoBarras: String(data.codigoBarras || ''),
    nome: String(data.nome || ''),
    quantidadeAtual: Number(data.quantidadeAtual || 0),
    precoCompra: Number(data.precoCompra || 0),
    precoVenda: Number(data.precoVenda || 0),
  };
}
