import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import produtoRoutes from './routes/produtos.js';
import movimentacaoRoutes from './routes/movimentacoes.js';
import relatorioRoutes from './routes/relatorios.js';
import authRoutes from './routes/auth.js';
import dbController from './dbController.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('JWT_SECRET é obrigatório em produção');
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  }),
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { sucesso: false, erro: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});

app.get('/', (req, res) => {
  res.send('Servidor funcionando!');
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    banco_dados: 'pronto',
  });
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/produtos', authMiddleware, produtoRoutes);
app.use('/api/movimentacoes', authMiddleware, movimentacaoRoutes);
app.use('/api/relatorios', authMiddleware, relatorioRoutes);

async function startServer() {
  const dbReady = await dbController.initialize();
  if (!dbReady) {
    console.error('Falha ao inicializar banco de dados');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  startServer();
}

export default app;
export { app, startServer };
