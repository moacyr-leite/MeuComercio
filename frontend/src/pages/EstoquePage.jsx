import { useEffect, useState } from 'react'
import Card from '../components/Card'
import PagePane from './PagePane'
import { getProdutos } from '../services/api.js'

function EstoquePage() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadProdutos() {
      setLoading(true)
      setError(null)

      try {
        const response = await getProdutos()
        setProdutos(response.dados || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProdutos()
  }, [])

  return (
    <PagePane>
      {loading && <p>Carregando produtos...</p>}
      {error && <p className="error-message">Erro: {error}</p>}
      {!loading && !error && produtos.length === 0 && <p>Nenhum produto encontrado.</p>}

      <div className="section-row">
        {produtos.slice(0, 2).map((produto) => (
          <Card
            key={produto.id}
            title={`Cód. ${produto.codigoBarras}`}
            subtitle={produto.nome}
            value={`${produto.quantidadeAtual} unid.`}
            description={`Preço venda: R$ ${produto.precoVenda.toFixed(2)}`}
            imageLabel={produto.nome?.slice(0, 2).toUpperCase()}
          />
        ))}
      </div>

      {produtos.slice(2).map((produto) => (
        <Card
          key={produto.id}
          title={`Cód. ${produto.codigoBarras}`}
          subtitle={produto.nome}
          value={`${produto.quantidadeAtual} unid.`}
          description={`Preço venda: R$ ${produto.precoVenda.toFixed(2)}`}
          imageLabel={produto.nome?.slice(0, 2).toUpperCase()}
        />
      ))}
    </PagePane>
  )
}

export default EstoquePage
