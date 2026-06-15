import Card from '../components/Card'
import PagePane from './PagePane'

function DashboardPage() {
  return (
    <PagePane>
      <Card
        title="Painel geral"
        subtitle="Visão rápida das principais métricas"
        description="Use os cards abaixo para acompanhar desempenho"
        imageLabel="DG"
      />
      <div className="dashboard-grid">
        <Card title="Vendas" subtitle="R$ 12.400" imageLabel="V" />
        <Card title="Pedidos" subtitle="147" imageLabel="P" />
      </div>
    </PagePane>
  )
}

export default DashboardPage
