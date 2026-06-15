import { useState } from 'react'
import { login } from '../services/api.js'

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@meucomercio.local');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await login({ email, senha });
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.usuario));
      onLoginSuccess(response.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>MeuComercio</h1>
        <p>Entre para gerenciar estoque e vendas.</p>
        <form className="user-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
