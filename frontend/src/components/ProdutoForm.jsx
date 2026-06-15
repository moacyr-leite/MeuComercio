import { useEffect, useState } from 'react'

const EMPTY_FORM = {
  codigoBarras: '',
  nome: '',
  quantidadeAtual: '',
  precoCompra: '',
  precoVenda: '',
};

function ProdutoForm({ initialData, onSubmit, onCancel, submitting, submitLabel = 'Salvar' }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);

  useEffect(() => {
    setForm(initialData || EMPTY_FORM);
  }, [initialData]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      codigoBarras: form.codigoBarras.trim(),
      nome: form.nome.trim(),
      quantidadeAtual: Number(form.quantidadeAtual),
      precoCompra: Number(form.precoCompra),
      precoVenda: Number(form.precoVenda),
    });
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <label>
        Código de barras
        <input
          name="codigoBarras"
          value={form.codigoBarras}
          onChange={handleChange}
          required
          inputMode="numeric"
        />
      </label>
      <label>
        Nome do produto
        <input name="nome" value={form.nome} onChange={handleChange} required />
      </label>
      <label>
        Quantidade em estoque
        <input
          name="quantidadeAtual"
          type="number"
          min="0"
          step="1"
          value={form.quantidadeAtual}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Preço de compra (R$)
        <input
          name="precoCompra"
          type="number"
          min="0"
          step="0.01"
          value={form.precoCompra}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Preço de venda (R$)
        <input
          name="precoVenda"
          type="number"
          min="0"
          step="0.01"
          value={form.precoVenda}
          onChange={handleChange}
          required
        />
      </label>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ProdutoForm;
