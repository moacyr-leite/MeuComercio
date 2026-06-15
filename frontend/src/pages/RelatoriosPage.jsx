import Card from '../components/Card'
import PagePane from './PagePane'

function RelatoriosPage() {
  return (
    <PagePane>
      <Card
        title="Relatório mensal"
        subtitle="Faturamento e lucros"
        description="Análise rápida das vendas do mês"
        imageLabel="RM"
      />
      <Card
        title="Relatório estoque"
        subtitle="Itens críticos"
        description="Produtos com estoque baixo"
        imageLabel="RE"
      />
    </PagePane>
  )
}

export default RelatoriosPage
