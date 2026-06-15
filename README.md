# Meu Comércio

Sistema simples de controle de estoque e vendas para pequenos mercados e comércios familiares.

## Objetivo

O Meu Comércio foi criado para ajudar pequenos comerciantes a controlarem produtos, estoque e movimentações de forma prática e intuitiva.

O sistema é focado em:
- simplicidade
- acessibilidade
- uso em celulares
- facilidade para pessoas idosas

---

# Tecnologias

## Frontend
- React
- Vite
- JavaScript

## Backend
- Node.js
- Express
- JWT para autenticação

## Banco de Dados
- Arquivo JSON local (`backend/data/database.json`)

---

# Funcionalidades do MVP

- Cadastro de produtos
- Controle de estoque
- Entrada e saída de mercadorias
- Histórico de movimentações
- Login de usuários
- Busca rápida
- Dashboard e relatórios com dados reais

---

# Público-alvo

- Pequenos mercados
- Mercadinhos de bairro
- Comércio familiar
- Usuários com pouca experiência em tecnologia

---

# Princípios de UX

O sistema é desenvolvido pensando em:
- botões grandes
- navegação simples
- pouco texto
- alta legibilidade
- poucos cliques

---

# Como executar

No diretório raiz do projeto:

```bash
npm install
npm run dev
```

Comandos úteis:

```bash
npm run frontend   # inicia o frontend com Vite
npm run backend    # inicia o backend com Node/Express
npm run dev        # inicia frontend e backend em paralelo
```

Acesse o frontend em `http://localhost:5173` e faça login com:

- **Email:** `admin@meucomercio.local`
- **Senha:** `admin123`

O usuário padrão é criado automaticamente na primeira inicialização do backend.

---

# Estrutura do Projeto

```bash
top-level package.json
frontend/          # app React + Vite
backend/           # servidor Node.js + Express
backend/data/      # persistência JSON
```

---

# API principal

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Autenticação |
| GET | `/api/produtos` | Listar produtos |
| POST | `/api/produtos` | Criar produto |
| PUT | `/api/produtos/:id` | Atualizar produto |
| DELETE | `/api/produtos/:id` | Excluir produto |
| GET | `/api/movimentacoes` | Listar movimentações |
| POST | `/api/movimentacoes` | Registrar entrada, venda ou ajuste |
| GET | `/api/relatorios/resumo` | Métricas do dashboard |

Rotas protegidas exigem header `Authorization: Bearer <token>`.

---

# Observações

- O frontend está em `frontend/`.
- O backend está em `backend/`.
- Movimentações do tipo `VENDA`, `ENTRADA` e `AJUSTE` atualizam o estoque automaticamente.
- Vendas com estoque insuficiente são rejeitadas pela API.
