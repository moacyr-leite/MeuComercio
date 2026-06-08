# Banco de Dados - Meu Comércio

## Estrutura Offline / Local

O banco de dados do Meu Comércio é baseado em **JSON local** e projetado para rodar offline. O arquivo de dados fica em `backend/data/database.json` e é inicializado automaticamente sempre que o servidor é iniciado.

### Arquivos principais

- **`schema.js`** - Define a estrutura das tabelas e campos do banco
- **`init.js`** - Inicializa o banco local, garante diretório/arquivo e valida a estrutura
- **`index.js`** - Ponto de exportação do módulo de banco de dados
- **`../src/dbController.js`** - Controlador CRUD que usa o banco local JSON

## Objetivo

Manter a aplicação funcionando completamente offline, sem dependência de bancos remotos ou conexões de rede. O foco é o usuário principal, com clientes e processos como entidades principais.

## Tabelas

### `usuarios`
Dados do usuário do sistema (usuário local/principal).

```javascript
{
  id: INTEGER,
  nome: TEXT (obrigatório),
  email: TEXT,
  criado_em: TEXT,
  atualizado_em: TEXT
}
```

### `clientes`
Pessoas/empresas atendidas pelo usuário.

```javascript
{
  id: INTEGER,
  nome: TEXT (obrigatório),
  telefone: TEXT,
  email: TEXT,
  observacao: TEXT,
  criado_em: TEXT,
  atualizado_em: TEXT
}
```

### `processos`
Listas de processos/tarefas vinculadas a clientes.

```javascript
{
  id: INTEGER,
  cliente_id: INTEGER (FK → clientes),
  titulo: TEXT (obrigatório),
  descricao: TEXT,
  status: TEXT ('pendente', 'em_progresso', 'concluido'),
  prioridade: TEXT ('baixa', 'media', 'alta'),
  data_inicio: TEXT,
  data_fim: TEXT,
  observacoes: TEXT,
  criado_em: TEXT,
  atualizado_em: TEXT
}
```

### `produtos`
Produtos do comércio com controle de estoque simples.

```javascript
{
  id: INTEGER,
  codigo_barra: TEXT (único, opcional),
  nome: TEXT (obrigatório),
  descricao: TEXT,
  preco_compra: REAL (obrigatório),
  preco_venda: REAL (obrigatório),
  estoque: INTEGER (padrão: 0),
  criado_em: TEXT,
  data_ultimo_comprado: TEXT (data da última compra/reposição),
  atualizado_em: TEXT
}
```

## Como funciona

### Inicialização automática

Quando o servidor é iniciado, o sistema:

1. ✅ Verifica se o diretório `backend/data/` existe
2. ✅ Verifica se o arquivo `database.json` existe
3. ✅ Valida a estrutura do banco local
4. ✅ Cria ou atualiza a estrutura se necessário

### Uso no código

```javascript
const dbController = require('./dbController');

await dbController.initialize();
const clientes = dbController.getAll('clientes');
const novoCliente = dbController.insert('clientes', {
  nome: 'Maria Silva',
  telefone: '1199999-9999',
});
```

### Estrutura de dados gerada

```json
{
  "usuarios": [],
  "clientes": [],
  "processos": [],
  "produtos": []
}
```

## Próximas melhorias

- [ ] Adicionar validação de campos em `dbController`
- [ ] Implementar APIs específicas para clientes e processos
- [ ] Adicionar persistência mais robusta (schema migrations)
- [ ] Adicionar suporte a múltiplos perfis locais
