import { useId, useMemo, useState } from 'react';
import ScanCode from './ScanCode';

function BarcodeInput({
  value,
  onChange,
  label = 'Código de barras',
  required = true,
  disabled = false,
  suggestions = [],
  onSelectSuggestion,
  emptyMessage = 'Nenhum produto compatível encontrado.',
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const inputId = useId();

  function handleManualChange(event) {
    onChange(event.target.value);
    if (scanMessage) {
      setScanMessage('');
    }
  }

  function handleScanClick() {
    if (disabled) return;
    setIsScanning((prev) => !prev);
    setScanMessage('');
  }

  function handleScanResult(result) {
    const scannedValue = typeof result === 'string' ? result : result?.text || '';
    if (scannedValue) {
      onChange(scannedValue);
      setScanMessage('Leitura concluída. Consulte as opções compatíveis abaixo.');
    } else {
      setScanMessage('Nenhum código foi identificado. Tente novamente.');
    }
    setIsScanning(false);
  }

  function handleSuggestionClick(suggestion) {
    if (typeof onSelectSuggestion === 'function') {
      onSelectSuggestion(suggestion);
    }
  }

  const resolvedSuggestions = useMemo(() => {
    if (!Array.isArray(suggestions)) return [];
    return suggestions.slice(0, 5);
  }, [suggestions]);

  return (
    <label htmlFor={inputId} className="barcode-input-field">
      <span>{label}</span>
      <div className="barcode-input-wrapper">
        <input
          id={inputId}
          name="codigoBarras"
          value={value}
          onChange={handleManualChange}
          required={required}
          inputMode="numeric"
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          className="barcode-scan-button"
          onClick={handleScanClick}
          aria-label="Ativar leitura de código de barras"
          disabled={disabled}
        >
          📷
        </button>
      </div>

      {resolvedSuggestions.length > 0 && (
        <ul className="barcode-suggestions">
          {resolvedSuggestions.map((suggestion) => {
            const label = typeof suggestion === 'string' ? suggestion : suggestion.label;
            const id = typeof suggestion === 'string' ? suggestion : suggestion.id;
            return (
              <li key={id}>
                <button type="button" onClick={() => handleSuggestionClick(suggestion)}>
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {value && resolvedSuggestions.length === 0 && <p className="barcode-scan-message">{emptyMessage}</p>}

      {isScanning && (
        <div className="barcode-scan-panel">
          <p className="barcode-scan-help">Aponte a câmera para o código e aguarde a leitura.</p>
          <ScanCode onCodeDetected={handleScanResult} />
          <button type="button" className="secondary-button" onClick={() => setIsScanning(false)}>
            Fechar leitura
          </button>
        </div>
      )}

      {scanMessage && <p className="barcode-scan-message">{scanMessage}</p>}
    </label>
  );
}

export default BarcodeInput;
