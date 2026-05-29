import { useEffect, useState } from 'react'
import { getProdutos } from '../services/api'

function Produtos() {
  const [produtos, setProdutos] = useState([])

  useEffect(() => {
    async function carregarProdutos() {
      const data = await getProdutos()
      setProdutos(data)
    }

    carregarProdutos()
  }, [])

  return (
    <div>
      <h1>Produtos</h1>

      {produtos.map((produto) => (
        <div key={produto.id}>
          <p>{produto.nome}</p>
          <p>R$ {produto.preco}</p>
        </div>
      ))}
    </div>
  )
}

export default Produtos