## API CRUD de Produtos

Documentação dos endpoints para gerenciar produtos.

### Base URL
```
http://localhost:3000/api/produtos
```

### 1. Listar todos os produtos

```http
GET /api/produtos
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "quantidade": 2,
  "dados": [
    {
      "id": 1,
      "codigo_barra": "1234567890123",
      "nome": "Arroz Integral 5kg",
      "descricao": "Arroz integral de qualidade premium",
      "preco_compra": 15.00,
      "preco_venda": 25.50,
      "estoque": 100,
      "criado_em": "2026-06-07T10:30:00.000Z",
      "data_ultimo_comprado": "2026-06-01",
      "atualizado_em": "2026-06-07T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Buscar produto por ID

```http
GET /api/produtos/:id
```

**Exemplo:**
```http
GET /api/produtos/1
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "dados": {
    "id": 1,
    "codigo_barra": "1234567890123",
    "nome": "Arroz Integral 5kg",
    "descricao": "Arroz integral de qualidade premium",
    "preco_compra": 15.00,
    "preco_venda": 25.50,
    "estoque": 100,
    "criado_em": "2026-06-07T10:30:00.000Z",
    "data_ultimo_comprado": "2026-06-01",
    "atualizado_em": "2026-06-07T10:30:00.000Z"
  }
}
```

**Resposta (404 - Produto não encontrado):**
```json
{
  "sucesso": false,
  "erro": "Produto com ID 999 não encontrado"
}
```

---

### 3. Criar novo produto

```http
POST /api/produtos
Content-Type: application/json
```

**Body (obrigatório: nome, preco_compra, preco_venda):**
```json
{
  "codigo_barra": "1234567890123",
  "nome": "Feijão Preto 1kg",
  "descricao": "Feijão preto de qualidade",
  "preco_compra": 3.50,
  "preco_venda": 7.99,
  "estoque": 50
}
```

**Resposta (201):**
```json
{
  "sucesso": true,
  "mensagem": "Produto criado com sucesso",
  "dados": {
    "id": 2,
    "codigo_barra": "1234567890123",
    "nome": "Feijão Preto 1kg",
    "descricao": "Feijão preto de qualidade",
    "preco_compra": 3.50,
    "preco_venda": 7.99,
    "estoque": 50,
    "criado_em": "2026-06-07T10:35:00.000Z",
    "data_ultimo_comprado": null,
    "atualizado_em": "2026-06-07T10:35:00.000Z"
  }
}
```

**Resposta (400 - Campos obrigatórios faltando):**
```json
{
  "sucesso": false,
  "erro": "Campos obrigatórios: nome, preco_compra, preco_venda"
}
```

---

### 4. Atualizar produto

```http
PUT /api/produtos/:id
Content-Type: application/json
```

**Exemplo:**
```http
PUT /api/produtos/1
```

**Body (todos os campos são opcionais):**
```json
{
  "nome": "Arroz Integral Premium 5kg",
  "preco_venda": 26.99,
  "estoque": 95,
  "data_ultimo_comprado": "2026-06-07"
}
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Produto atualizado com sucesso",
  "dados": {
    "id": 1,
    "codigo_barra": "1234567890123",
    "nome": "Arroz Integral Premium 5kg",
    "descricao": "Arroz integral de qualidade premium",
    "preco_compra": 15.00,
    "preco_venda": 26.99,
    "estoque": 95,
    "criado_em": "2026-06-07T10:30:00.000Z",
    "data_ultimo_comprado": "2026-06-07",
    "atualizado_em": "2026-06-07T10:40:00.000Z"
  }
}
```

**Resposta (404 - Produto não encontrado):**
```json
{
  "sucesso": false,
  "erro": "Produto com ID 999 não encontrado"
}
```

---

### 5. Deletar produto

```http
DELETE /api/produtos/:id
```

**Exemplo:**
```http
DELETE /api/produtos/1
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Produto deletado com sucesso",
  "dados": {
    "id": 1,
    "codigo_barra": "1234567890123",
    "nome": "Arroz Integral 5kg",
    "descricao": "Arroz integral de qualidade premium",
    "preco_compra": 15.00,
    "preco_venda": 25.50,
    "estoque": 100,
    "criado_em": "2026-06-07T10:30:00.000Z",
    "data_ultimo_comprado": "2026-06-01",
    "atualizado_em": "2026-06-07T10:30:00.000Z"
  }
}
```

**Resposta (404 - Produto não encontrado):**
```json
{
  "sucesso": false,
  "erro": "Produto com ID 999 não encontrado"
}
```

---

## Campos do Produto

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | INTEGER | Sim (auto) | Identificador único |
| codigo_barra | TEXT | Não | Código de barras do produto |
| nome | TEXT | Sim | Nome do produto |
| descricao | TEXT | Não | Descrição detalhada |
| preco_compra | REAL | Sim | Preço de compra |
| preco_venda | REAL | Sim | Preço de venda |
| estoque | INTEGER | Não | Quantidade em estoque |
| criado_em | TEXT | Sim (auto) | Data de criação (ISO 8601) |
| data_ultimo_comprado | TEXT | Não | Data da última compra |
| atualizado_em | TEXT | Sim (auto) | Data da última atualização |

---

## Exemplos com cURL

### Listar todos
```bash
curl http://localhost:3000/api/produtos
```

### Buscar por ID
```bash
curl http://localhost:3000/api/produtos/1
```

### Criar
```bash
curl -X POST http://localhost:3000/api/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Feijão",
    "preco_compra": 3.50,
    "preco_venda": 7.99,
    "estoque": 50
  }'
```

### Atualizar
```bash
curl -X PUT http://localhost:3000/api/produtos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "estoque": 95,
    "preco_venda": 26.99
  }'
```

### Deletar
```bash
curl -X DELETE http://localhost:3000/api/produtos/1
```
