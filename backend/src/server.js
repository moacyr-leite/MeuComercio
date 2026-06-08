const express = require("express");
const dbController = require("./dbController").default;

const app = express();

// Middleware
app.use(express.json());

// Inicializar banco de dados
(async () => {
  const dbReady = await dbController.initialize();
  if (!dbReady) {
    console.error("Falha ao inicializar banco de dados");
    process.exit(1);
  }
})();

// Rotas
app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    banco_dados: "pronto",
  });
});

// ============================================
// CRUD PRODUTOS
// ============================================

// GET - Listar todos os produtos
app.get("/api/produtos", (req, res) => {
  try {
    const produtos = dbController.getAll("produtos");
    res.json({
      sucesso: true,
      quantidade: produtos.length,
      dados: produtos,
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message,
    });
  }
});

// GET - Buscar produto por ID
app.get("/api/produtos/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const produto = dbController.getById("produtos", id);

    if (!produto) {
      return res.status(404).json({
        sucesso: false,
        erro: `Produto com ID ${id} não encontrado`,
      });
    }

    res.json({
      sucesso: true,
      dados: produto,
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message,
    });
  }
});

// POST - Criar novo produto
app.post("/api/produtos", (req, res) => {
  try {
    const { nome, descricao, preco_compra, preco_venda, estoque, codigo_barra } = req.body;

    // Validar campos obrigatórios
    if (!nome || !preco_compra || !preco_venda) {
      return res.status(400).json({
        sucesso: false,
        erro: "Campos obrigatórios: nome, preco_compra, preco_venda",
      });
    }

    const novoProduto = dbController.insert("produtos", {
      nome,
      descricao: descricao || "",
      preco_compra: parseFloat(preco_compra),
      preco_venda: parseFloat(preco_venda),
      estoque: parseInt(estoque) || 0,
      codigo_barra: codigo_barra || null,
    });

    res.status(201).json({
      sucesso: true,
      mensagem: "Produto criado com sucesso",
      dados: novoProduto,
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message,
    });
  }
});

// PUT - Atualizar produto
app.put("/api/produtos/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, descricao, preco_compra, preco_venda, estoque, codigo_barra } = req.body;

    // Verificar se produto existe
    const produto = dbController.getById("produtos", id);
    if (!produto) {
      return res.status(404).json({
        sucesso: false,
        erro: `Produto com ID ${id} não encontrado`,
      });
    }

    // Construir dados para atualizar (apenas campos fornecidos)
    const dadosAtualizacao = {};
    if (nome !== undefined) dadosAtualizacao.nome = nome;
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
    if (preco_compra !== undefined) dadosAtualizacao.preco_compra = parseFloat(preco_compra);
    if (preco_venda !== undefined) dadosAtualizacao.preco_venda = parseFloat(preco_venda);
    if (estoque !== undefined) dadosAtualizacao.estoque = parseInt(estoque);
    if (codigo_barra !== undefined) dadosAtualizacao.codigo_barra = codigo_barra;

    const produtoAtualizado = dbController.update("produtos", id, dadosAtualizacao);

    res.json({
      sucesso: true,
      mensagem: "Produto atualizado com sucesso",
      dados: produtoAtualizado,
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message,
    });
  }
});

// DELETE - Deletar produto
app.delete("/api/produtos/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verificar se produto existe
    const produto = dbController.getById("produtos", id);
    if (!produto) {
      return res.status(404).json({
        sucesso: false,
        erro: `Produto com ID ${id} não encontrado`,
      });
    }

    const produtoDeletado = dbController.delete("produtos", id);

    res.json({
      sucesso: true,
      mensagem: "Produto deletado com sucesso",
      dados: produtoDeletado,
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});