import Card from '../components/Card'
import PagePane from './PagePane'

function CaixaPage() {
  return (
    <PagePane>
      <Card
        title="Caixa diário"
        subtitle="R$ 5.420,00"
        description="Vendas confirmadas hoje"
        imageLabel="CA"
      />
      <div className="dashboard-grid">
        <Card title="Entrada" subtitle="R$ 6.100,00" imageLabel="EN" />
        <Card title="Saída" subtitle="R$ 680,00" imageLabel="SA" />
      </div>
    </PagePane>
  )
}

export default CaixaPage
