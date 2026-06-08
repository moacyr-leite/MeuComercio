/**
 * Exemplos de uso da API do dbController
 * 
 * Este arquivo contém exemplos de como usar as operações CRUD
 * Copie e adapte conforme necessário para seus endpoints
 */

const dbController = require('./dbController');

// ============================================
// EXEMPLO 1: USUÁRIOS
// ============================================

// Criar novo usuário (geralmente só um, o principal)
const novoUsuario = dbController.insert('usuarios', {
  nome: 'João Silva',
  email: 'joao@example.com',
});
console.log('Usuário criado:', novoUsuario);

// Listar todos os usuários
const usuarios = dbController.getAll('usuarios');
console.log('Todos os usuários:', usuarios);

// ============================================
// EXEMPLO 2: CLIENTES
// ============================================

// Criar novo cliente
const novoCliente = dbController.insert('clientes', {
  nome: 'Maria Santos',
  telefone: '(11) 99999-9999',
  email: 'maria@example.com',
  observacao: 'Cliente VIP',
});
console.log('Cliente criado:', novoCliente);

// Listar todos os clientes
const clientes = dbController.getAll('clientes');
console.log('Todos os clientes:', clientes);

// Buscar cliente por ID
const cliente = dbController.getById('clientes', 1);
console.log('Cliente ID 1:', cliente);

// Atualizar cliente
const clienteAtualizado = dbController.update('clientes', 1, {
  observacao: 'Cliente VIP - Desconto especial',
});
console.log('Cliente atualizado:', clienteAtualizado);

// ============================================
// EXEMPLO 3: PROCESSOS
// ============================================

// Criar novo processo
const novoProcesso = dbController.insert('processos', {
  cliente_id: 1,
  titulo: 'Implementação de sistema',
  descricao: 'Desenvolvimento de novo sistema ERP',
  status: 'em_progresso',
  prioridade: 'alta',
  data_inicio: '2026-06-07',
  data_fim: '2026-07-07',
  observacoes: 'Cliente aguardando prototipo',
});
console.log('Processo criado:', novoProcesso);

// Listar todos os processos
const processos = dbController.getAll('processos');
console.log('Todos os processos:', processos);

// Buscar processos de um cliente específico
const processosCliente1 = processos.filter((p) => p.cliente_id === 1);
console.log('Processos do cliente 1:', processosCliente1);

// Atualizar status de um processo
const processoAtualizado = dbController.update('processos', 1, {
  status: 'concluido',
  data_fim: '2026-06-30',
});
console.log('Processo atualizado:', processoAtualizado);

// ============================================
// EXEMPLO 4: PRODUTOS
// ============================================

// Criar novo produto
const novoProduto = dbController.insert('produtos', {
  codigo_barra: '1234567890123',
  nome: 'Arroz Integral 5kg',
  descricao: 'Arroz integral de qualidade premium',
  preco_compra: 15.00,
  preco_venda: 25.50,
  estoque: 100,
  data_ultimo_comprado: '2026-06-01',
});
console.log('Produto criado:', novoProduto);

// Listar todos os produtos
const produtos = dbController.getAll('produtos');
console.log('Todos os produtos:', produtos);

// Buscar produto por ID
const produto = dbController.getById('produtos', 1);
console.log('Produto ID 1:', produto);

// Atualizar estoque e preço
const produtoAtualizado = dbController.update('produtos', 1, {
  estoque: 95,
  preco_venda: 26.00,
  data_ultimo_comprado: '2026-06-07',
});
console.log('Produto atualizado:', produtoAtualizado);

// Buscar produtos com estoque baixo
const estoqueBaixo = produtos.filter((p) => p.estoque < 20);
console.log('Produtos com estoque baixo:', estoqueBaixo);

// Calcular margem de lucro
const margem = ((novoProduto.preco_venda - novoProduto.preco_compra) / novoProduto.preco_compra * 100).toFixed(2);
console.log(`Margem de lucro: ${margem}%`);

// ============================================
// EXEMPLO 5: TRATAMENTO DE ERROS
// ============================================

try {
  // Tentar acessar tabela inexistente
  dbController.getAll('tabela_inexistente');
} catch (error) {
  console.error('Erro:', error.message);
}

try {
  // Tentar buscar ID inexistente
  const inexistente = dbController.getById('clientes', 999);
  if (!inexistente) {
    console.log('Cliente não encontrado');
  }
} catch (error) {
  console.error('Erro:', error.message);
}

// ============================================
// EXEMPLO 6: OPERAÇÕES EM LOTE
// ============================================

// Criar múltiplos clientes
const clientesBatch = [
  { nome: 'Alice Silva', telefone: '11 98888-8888', email: 'alice@example.com' },
  { nome: 'Bob Santos', telefone: '11 97777-7777', email: 'bob@example.com' },
  { nome: 'Carol Costa', telefone: '11 96666-6666', email: 'carol@example.com' },
].map((dados) => dbController.insert('clientes', dados));

console.log('Clientes criados em lote:', clientesBatch);

// Criar múltiplos produtos
const produtosBatch = [
  { nome: 'Feijão 1kg', preco_compra: 3.50, preco_venda: 7.99, estoque: 50 },
  { nome: 'Açúcar 1kg', preco_compra: 2.50, preco_venda: 5.99, estoque: 75 },
  { nome: 'Sal 1kg', preco_compra: 1.00, preco_venda: 2.99, estoque: 100 },
].map((dados) => dbController.insert('produtos', dados));

console.log('Produtos criados em lote:', produtosBatch);
