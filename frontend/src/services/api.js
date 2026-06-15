const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.erro || errorBody?.message || response.statusText;
    throw new Error(message || 'Erro ao se comunicar com a API');
  }

  return response.json();
}

export function getProdutos() {
  return request('/api/produtos');
}
