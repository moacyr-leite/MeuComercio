import { useEffect, useState } from 'react'
import Card from '../components/Card'
import PagePane from './PagePane'
import { getRelatorioResumo } from '../services/api.js'

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function DashboardPage() {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadResumo() {
      setLoading(true);
      setError(null);

      try {
        const response = await getRelatorioResumo();
        setResumo(response.dados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadResumo();
  }, []);

  return (
    <PagePane>
      {loading && <p className="status-message">Carregando painel...</p>}
      {error && <p className="error-message">Erro: {error}</p>}

      {!loading && !error && resumo && (
        <>
          <Card
            title="Painel geral"
            subtitle="Visão rápida das principais métricas"
            description={`${resumo.totalProdutos} produto(s) cadastrado(s)`}
            imageLabel="DG"
          />
          <div className="dashboard-grid">
            <Card
              title="Vendas hoje"
              subtitle={formatCurrency(resumo.vendasHoje.total)}
              description={`${resumo.vendasHoje.quantidade} venda(s) confirmada(s)`}
              imageLabel="V"
            />
            <Card
              title="Vendas no mês"
              subtitle={formatCurrency(resumo.vendasMes.total)}
              description={`${resumo.vendasMes.quantidade} venda(s) no mês`}
              imageLabel="M"
            />
          </div>

          {resumo.produtosEstoqueBaixo.length > 0 ? (
            <>
              <h2 className="section-title">Estoque baixo</h2>
              {resumo.produtosEstoqueBaixo.map((produto) => (
                <Card
                  key={produto.id}
                  title={produto.nome}
                  subtitle={`${produto.quantidadeAtual} unid.`}
                  description={`Abaixo de ${resumo.estoqueBaixoLimite} unidades`}
                  imageLabel="!"
                />
              ))}
            </>
          ) : (
            <p className="status-message">Nenhum produto com estoque baixo.</p>
          )}
        </>
      )}
    </PagePane>
  );
}

export default DashboardPage;
