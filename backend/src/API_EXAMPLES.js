/**
 * Exemplos de uso da API MeuComercio
 *
 * Requer servidor rodando em http://localhost:3000
 * e token JWT obtido via POST /api/auth/login
 */

const API_BASE = 'http://localhost:3000';
const CREDENCIAIS = {
  email: 'admin@meucomercio.local',
  senha: 'admin123',
};

async function login() {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENCIAIS),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.erro || 'Falha no login');
  }

  return data.token;
}

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.erro || data.message || 'Erro na requisição');
  }

  return data;
}

async function exemplos() {
  const token = await login();
  console.log('Login realizado com sucesso');

  const produtoCriado = await apiRequest('/api/produtos', token, {
    method: 'POST',
    body: JSON.stringify({
      codigoBarras: '7891234567890',
      nome: 'Arroz Integral 5kg',
      quantidadeAtual: 20,
      precoCompra: 15,
      precoVenda: 25.5,
    }),
  });
  console.log('Produto criado:', produtoCriado.dados);

  const produtoId = produtoCriado.dados.id;

  const entrada = await apiRequest('/api/movimentacoes', token, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'ENTRADA',
      dataHora: new Date().toISOString(),
      itens: [
        {
          produtoId,
          quantidade: 10,
          precoUnitario: 15,
        },
      ],
    }),
  });
  console.log('Entrada registrada:', entrada.dados);

  const venda = await apiRequest('/api/movimentacoes', token, {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'VENDA',
      dataHora: new Date().toISOString(),
      itens: [
        {
          produtoId,
          quantidade: 2,
          precoUnitario: 25.5,
        },
      ],
    }),
  });
  console.log('Venda registrada:', venda.dados);

  const resumo = await apiRequest('/api/relatorios/resumo', token);
  console.log('Resumo:', resumo.dados);

  const produtos = await apiRequest('/api/produtos', token);
  console.log('Produtos após movimentações:', produtos.dados);
}

exemplos().catch((error) => {
  console.error('Erro nos exemplos:', error.message);
});
