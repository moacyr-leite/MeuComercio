import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

let testDir;
let app;
let token;
let produtoId;

beforeAll(async () => {
  testDir = mkdtempSync(join(tmpdir(), 'meucomercio-test-'));
  process.env.DB_PATH = join(testDir, 'database.json');
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';

  const dbController = (await import('../src/dbController.js')).default;
  const initialized = await dbController.initialize();
  if (!initialized) {
    throw new Error('Falha ao inicializar banco de testes');
  }

  app = (await import('../src/server.js')).default;
});

afterAll(() => {
  if (testDir) {
    rmSync(testDir, { recursive: true, force: true });
  }
});

describe('API MeuComercio', () => {
  it('faz login com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@meucomercio.local', senha: 'admin123' });

    expect(response.status).toBe(200);
    expect(response.body.sucesso).toBe(true);
    expect(response.body.token).toBeTruthy();
    token = response.body.token;
  });

  it('rejeita login com credenciais inválidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@meucomercio.local', senha: 'senha-errada' });

    expect(response.status).toBe(401);
    expect(response.body.sucesso).toBe(false);
  });

  it('cria um produto autenticado', async () => {
    const response = await request(app)
      .post('/api/produtos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        codigoBarras: '7891234567890',
        nome: 'Produto Teste',
        quantidadeAtual: 10,
        precoCompra: 5,
        precoVenda: 8,
      });

    expect(response.status).toBe(201);
    expect(response.body.sucesso).toBe(true);
    expect(response.body.dados.nome).toBe('Produto Teste');
    produtoId = response.body.dados.id;
  });

  it('registra entrada de estoque', async () => {
    const response = await request(app)
      .post('/api/movimentacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo: 'ENTRADA',
        dataHora: new Date().toISOString(),
        itens: [
          {
            produtoId,
            quantidade: 5,
            precoUnitario: 5,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.sucesso).toBe(true);

    const produto = await request(app)
      .get(`/api/produtos/${produtoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(produto.body.dados.quantidadeAtual).toBe(15);
  });

  it('registra venda e atualiza estoque', async () => {
    const response = await request(app)
      .post('/api/movimentacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo: 'VENDA',
        dataHora: new Date().toISOString(),
        itens: [
          {
            produtoId,
            quantidade: 3,
            precoUnitario: 8,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.sucesso).toBe(true);

    const produto = await request(app)
      .get(`/api/produtos/${produtoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(produto.body.dados.quantidadeAtual).toBe(12);
  });

  it('rejeita venda com estoque insuficiente', async () => {
    const response = await request(app)
      .post('/api/movimentacoes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo: 'VENDA',
        dataHora: new Date().toISOString(),
        itens: [
          {
            produtoId,
            quantidade: 999,
            precoUnitario: 8,
          },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.sucesso).toBe(false);
    expect(response.body.erro).toMatch(/estoque insuficiente/i);
  });
});
