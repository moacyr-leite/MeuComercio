import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { getProdutos } from './services/api'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [produtos, setProdutos] = useState([])

  useEffect(() => {
    async function loadProdutos() {
      try {
        const data = await getProdutos()
        setProdutos(data)
      } catch (error) {
        console.error("Erro ao buscar produtos do backend:", error)
      }
    }
    loadProdutos()
  }, [])

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Meu Comércio</h1>
          <p>
            O frontend (React) está consumindo os dados do backend (FastAPI)!
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>

        <div style={{ marginTop: '2rem' }}>
          <h2>Lista de Produtos (Vindos do Backend):</h2>
          {produtos.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {produtos.map(produto => (
                <li key={produto.id} style={{ background: '#333', margin: '10px 0', padding: '10px', borderRadius: '8px' }}>
                  <strong>{produto.nome}</strong> - R$ {produto.preco.toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Carregando produtos...</p>
          )}
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
