import { useState, useEffect } from 'react'
import Scanner from './components/Scanner'
import localforage from 'localforage'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [produtos, setProdutos] = useState([])
  const [vendaAtual, setVendaAtual] = useState([])
  const [showScanner, setShowScanner] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    // Escuta eventos de conectividade para o Modo Offline
    const handleOnline = () => {
      setIsOnline(true)
      sincronizarVendasOffline()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    carregarProdutos()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  async function carregarProdutos() {
    try {
      const response = await fetch(`${API_URL}/produtos`)
      const data = await response.json()
      setProdutos(data)
      await localforage.setItem('produtos_cache', data)
    } catch (error) {
      console.warn("Offline, carregando produtos do cache...")
      const cache = await localforage.getItem('produtos_cache')
      if (cache) setProdutos(cache)
    }
  }

  async function sincronizarVendasOffline() {
    try {
      const vendasPendentes = await localforage.getItem('vendas_pendentes') || []
      if (vendasPendentes.length > 0) {
        const response = await fetch(`${API_URL}/vendas/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vendasPendentes)
        })
        if (response.ok) {
          setMensagem('Vendas offline sincronizadas com sucesso!')
          await localforage.setItem('vendas_pendentes', [])
        }
      }
    } catch (error) {
      console.error("Erro na sincronização:", error)
    }
    setTimeout(() => setMensagem(''), 4000)
  }

  function handleScan(codigo) {
    setShowScanner(false)
    const produto = produtos.find(p => p.codigo_barras === codigo)
    if (produto) {
      adicionarProdutoVenda(produto)
      setMensagem(`Produto ${produto.nome} adicionado!`)
    } else {
      setMensagem('Código não encontrado.')
    }
    setTimeout(() => setMensagem(''), 3000)
  }

  function adicionarProdutoVenda(produto) {
    setVendaAtual(prev => {
      const existente = prev.find(p => p.id === produto.id)
      if (existente) {
        return prev.map(p => p.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p)
      }
      return [...prev, { ...produto, quantidade: 1 }]
    })
  }

  function alterarQuantidade(id, delta) {
    setVendaAtual(prev => prev.map(p => {
      if (p.id === id) {
        const novaQtd = p.quantidade + delta
        return { ...p, quantidade: novaQtd > 0 ? novaQtd : 1 }
      }
      return p
    }))
  }

  async function finalizarVenda() {
    if (vendaAtual.length === 0) return

    const novaVenda = vendaAtual.map(item => ({
      produto_id: item.id,
      quantidade: item.quantidade,
      preco_total: item.preco * item.quantidade,
      data: new Date().toISOString()
    }))

    if (isOnline) {
      try {
        await fetch(`${API_URL}/vendas/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaVenda)
        })
        setMensagem('Venda registrada com sucesso!')
      } catch (error) {
        salvarOffline(novaVenda)
      }
    } else {
      await salvarOffline(novaVenda)
    }

    setVendaAtual([])
    setTimeout(() => setMensagem(''), 3000)
  }

  async function salvarOffline(venda) {
    const pendentes = await localforage.getItem('vendas_pendentes') || []
    await localforage.setItem('vendas_pendentes', [...pendentes, ...venda])
    setMensagem('Venda salva no celular (Offline)')
  }

  const totalVenda = vendaAtual.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)

  return (
    <main className="app-container">
      <header className={`status-bar ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? '🟢 Conectado' : '🔴 Offline (As vendas serão salvas no celular)'}
      </header>

      {mensagem && <div className="toast-mensagem">{mensagem}</div>}

      <h1>Ponto de Venda</h1>

      {showScanner ? (
        <div className="scanner-container">
          <button className="btn-cancelar" onClick={() => setShowScanner(false)}>Fechar Câmera</button>
          <Scanner onScanSuccess={handleScan} />
        </div>
      ) : (
        <button className="btn-acao primario" onClick={() => setShowScanner(true)}>
          📷 Ler Código de Barras
        </button>
      )}

      <div className="venda-atual">
        <h2>Carrinho - R$ {totalVenda.toFixed(2)}</h2>
        {vendaAtual.length === 0 ? (
          <p className="vazio">Nenhum produto adicionado.</p>
        ) : (
          <ul className="lista-carrinho">
            {vendaAtual.map(item => (
              <li key={item.id} className="item-carrinho">
                <div className="info">
                  <strong>{item.nome}</strong>
                  <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
                <div className="controles-qtd">
                  <button className="btn-qtd" onClick={() => alterarQuantidade(item.id, -1)}>-</button>
                  <input 
                    type="number" 
                    inputMode="numeric" 
                    value={item.quantidade} 
                    readOnly
                    className="input-qtd"
                  />
                  <button className="btn-qtd" onClick={() => alterarQuantidade(item.id, 1)}>+</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button 
        className="btn-acao sucesso" 
        disabled={vendaAtual.length === 0}
        onClick={finalizarVenda}
      >
        ✅ Finalizar Venda
      </button>

      <section className="lista-produtos-manual">
        <h3>Adicionar Manualmente</h3>
        <div className="grid-produtos">
          {produtos.map(p => (
            <button key={p.id} className="btn-produto-manual" onClick={() => adicionarProdutoVenda(p)}>
              {p.nome} <br/> R$ {p.preco.toFixed(2)}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
