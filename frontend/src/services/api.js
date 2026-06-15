const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    window.dispatchEvent(new Event('auth:logout'));
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.erro || errorBody?.message || response.statusText;
    throw new Error(message || 'Erro ao se comunicar com a API');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Produtos
export function getProdutos() {
  return request('/api/produtos');
}

export function createProduto(data) {
  return request('/api/produtos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProduto(id, data) {
  return request(`/api/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteProduto(id) {
  return request(`/api/produtos/${id}`, {
    method: 'DELETE',
  });
}

// Movimentações
export function getMovimentacoes() {
  return request('/api/movimentacoes');
}

export function createMovimentacao(data) {
  return request('/api/movimentacoes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Auth
export function login(credentials) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function validateSession() {
  return request('/api/auth/me');
}

// Relatórios
export function getRelatorioResumo() {
  return request('/api/relatorios/resumo');
}
