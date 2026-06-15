import cors from 'cors';
import express from 'express';
import produtoRoutes from './routes/produtos.js';
import movimentacaoRoutes from './routes/movimentacoes.js';
import dbController from './dbController.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Inicializar banco de dados
(async () => {
  const dbReady = await dbController.initialize();
  if (!dbReady) {
    console.error('Falha ao inicializar banco de dados');
    process.exit(1);
  }
})();

// Rotas
app.get('/', (req, res) => {
  res.send('Servidor funcionando!');
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    banco_dados: 'pronto',
  });
});

app.use('/api/produtos', produtoRoutes);
app.use('/api/movimentacoes', movimentacaoRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});