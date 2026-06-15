/**
 * Domínio Movimentação
 */

export const MovimentoTipos = {
  ENTRADA: 'ENTRADA',
  VENDA: 'VENDA',
  AJUSTE: 'AJUSTE',
};

const validTipos = new Set(Object.values(MovimentoTipos));

export function validateMovimentacao(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Dados de movimentação inválidos');
    return errors;
  }

  if (!data.tipo || !validTipos.has(data.tipo)) {
    errors.push('tipo é obrigatório e deve ser ENTRADA, VENDA ou AJUSTE');
  }

  if (!data.dataHora || Number.isNaN(Date.parse(data.dataHora))) {
    errors.push('dataHora é obrigatório e deve ser uma data válida');
  }

  if (!Array.isArray(data.itens) || data.itens.length === 0) {
    errors.push('itens é obrigatório e deve ser um array não vazio');
  } else {
    data.itens.forEach((item, index) => {
      if (!item.produtoId) {
        errors.push(`itens[${index}].produtoId é obrigatório`);
      }
      if (item.quantidade === undefined || Number.isNaN(Number(item.quantidade))) {
        errors.push(`itens[${index}].quantidade é obrigatório e deve ser número`);
      }
      if (item.precoUnitario === undefined || Number.isNaN(Number(item.precoUnitario))) {
        errors.push(`itens[${index}].precoUnitario é obrigatório e deve ser número`);
      }
    });
  }

  return errors;
}

export function buildMovimentacao(data) {
  return {
    id: data.id ? String(data.id) : undefined,
    tipo: data.tipo,
    dataHora: new Date(data.dataHora).toISOString(),
    itens: data.itens.map((item) => ({
      produtoId: String(item.produtoId),
      quantidade: Number(item.quantidade),
      precoUnitario: Number(item.precoUnitario),
    })),
  };
}
