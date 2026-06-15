import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import PagePane from './PagePane'
import { getMovimentacoes, getRelatorioResumo } from '../services/api.js'

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularTotalMovimentacao(movimentacao) {
  return movimentacao.itens.reduce(
    (total, item) => total + item.quantidade * item.precoUnitario,
    0,
  );
}

function RelatoriosPage() {
  const [resumo, setResumo] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroPeriodo, setFiltroPeriodo] = useState('MES');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [resumoResponse, movimentacoesResponse] = await Promise.all([
          getRelatorioResumo(),
          getMovimentacoes(),
        ]);
        setResumo(resumoResponse.dados);
        setMovimentacoes(movimentacoesResponse.dados || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const movimentacoesFiltradas = useMemo(() => {
    const hoje = new Date();

    return [...movimentacoes]
      .filter((mov) => {
        if (filtroTipo !== 'TODOS' && mov.tipo !== filtroTipo) return false;

        const dataMov = new Date(mov.dataHora);
        if (filtroPeriodo === 'HOJE') {
          return (
            dataMov.getFullYear() === hoje.getFullYear() &&
            dataMov.getMonth() === hoje.getMonth() &&
            dataMov.getDate() === hoje.getDate()
          );
        }

        return (
          dataMov.getFullYear() === hoje.getFullYear() &&
          dataMov.getMonth() === hoje.getMonth()
        );
      })
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
  }, [movimentacoes, filtroPeriodo, filtroTipo]);

  const totalFiltrado = useMemo(
    () => movimentacoesFiltradas.reduce((total, mov) => total + calcularTotalMovimentacao(mov), 0),
    [movimentacoesFiltradas],
  );

  return (
    <PagePane>
      {loading && <p className="status-message">Carregando relatórios...</p>}
      {error && <p className="error-message">Erro: {error}</p>}

      {!loading && !error && resumo && (
        <>
          <Card
            title="Relatório mensal"
            subtitle={formatCurrency(resumo.vendasMes.total)}
            description={`${resumo.vendasMes.quantidade} venda(s) no mês atual`}
            imageLabel="RM"
          />
          <Card
            title="Relatório estoque"
            subtitle={`${resumo.produtosEstoqueBaixo.length} item(ns) crítico(s)`}
            description={
              resumo.produtosEstoqueBaixo.length > 0
                ? 'Produtos com estoque baixo'
                : 'Nenhum produto crítico no momento'
            }
            imageLabel="RE"
          />

          {resumo.produtosEstoqueBaixo.length > 0 && (
            <>
              <h2 className="section-title">Itens críticos</h2>
              {resumo.produtosEstoqueBaixo.map((produto) => (
                <Card
                  key={produto.id}
                  title={produto.nome}
                  subtitle={`${produto.quantidadeAtual} unid.`}
                  description={`Limite: ${resumo.estoqueBaixoLimite} unidades`}
                  imageLabel="!"
                />
              ))}
            </>
          )}

          <h2 className="section-title">Histórico</h2>
          <div className="filter-row">
            <label>
              Tipo
              <select value={filtroTipo} onChange={(event) => setFiltroTipo(event.target.value)}>
                <option value="TODOS">Todos</option>
                <option value="VENDA">Venda</option>
                <option value="ENTRADA">Entrada</option>
                <option value="AJUSTE">Ajuste</option>
              </select>
            </label>
            <label>
              Período
              <select value={filtroPeriodo} onChange={(event) => setFiltroPeriodo(event.target.value)}>
                <option value="HOJE">Hoje</option>
                <option value="MES">Mês atual</option>
              </select>
            </label>
          </div>

          <Card
            title="Total filtrado"
            subtitle={formatCurrency(totalFiltrado)}
            description={`${movimentacoesFiltradas.length} movimentação(ões)`}
            imageLabel="T"
          />

          {movimentacoesFiltradas.length === 0 ? (
            <p className="status-message">Nenhuma movimentação para os filtros selecionados.</p>
          ) : (
            <div className="history-list">
              {movimentacoesFiltradas.map((mov) => (
                <div key={mov.id} className="history-item">
                  <div className="history-item-header">
                    <span className={`history-badge ${mov.tipo.toLowerCase()}`}>{mov.tipo}</span>
                    <strong>{formatCurrency(calcularTotalMovimentacao(mov))}</strong>
                  </div>
                  <p className="card-text">
                    {new Date(mov.dataHora).toLocaleString('pt-BR')} · {mov.itens.length} item(ns)
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PagePane>
  );
}

export default RelatoriosPage;
