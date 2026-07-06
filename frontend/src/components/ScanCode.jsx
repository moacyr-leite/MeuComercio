import { useState } from 'react';
import BarcodeScanner from 'react-qr-barcode-scanner';

function ScanCode({ onCodeDetected = () => {}, onError = () => {} }) {
  const [data, setData] = useState('Aguardando leitura...');

  function handleUpdate(_err, result) {
    try {
      if (result) {
        const text = typeof result.getText === 'function' ? result.getText() : result.text || String(result);
        setData(text);
        onCodeDetected(text);
      } else {
        setData('Nenhum código encontrado');
      }
    } catch (error) {
      console.error('Scanner error:', error);
      onError(error);
    }
  }

  function handleError(error) {
    console.error('Camera error:', error);
    setData('Erro na câmera');
    onError(error);
  }

  return (
    <div className="scan-code">
      <BarcodeScanner
        width={320}
        height={240}
        onUpdate={handleUpdate}
        onError={handleError}
        delay={1000}
      />
      <p className="barcode-scan-message">{data}</p>
    </div>
  );
}

export default ScanCode;
