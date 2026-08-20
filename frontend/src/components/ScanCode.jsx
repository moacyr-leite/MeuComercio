import { useEffect, useRef, useState } from 'react';
import BarcodeScanner from 'react-qr-barcode-scanner';

const CLEAR_MS = 700;

function readBarcodeText(result) {
  if (!result) return '';
  if (typeof result.getText === 'function') return String(result.getText() || '').trim();
  if (result.text) return String(result.text).trim();
  return String(result).trim();
}

function ScanCode({ onCodeDetected = () => {}, onError = () => {} }) {
  const [data, setData] = useState('Aguardando leitura...');
  const onCodeDetectedRef = useRef(onCodeDetected);
  const onErrorRef = useRef(onError);
  const lastEmittedRef = useRef('');
  const emptySinceRef = useRef(null);

  useEffect(() => {
    onCodeDetectedRef.current = onCodeDetected;
  }, [onCodeDetected]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  function emitCode(text) {
    lastEmittedRef.current = text;
    emptySinceRef.current = null;
    setData(text);
    onCodeDetectedRef.current(text);
  }

  function handleUpdate(_err, result) {
    try {
      const text = readBarcodeText(result);
      const now = Date.now();

      if (!text) {
        if (emptySinceRef.current == null) {
          emptySinceRef.current = now;
        }
        setData((current) =>
          lastEmittedRef.current ? 'Afaste o código e aproxime de novo para repetir' : 'Aguardando leitura...',
        );
        return;
      }

      const emptyDuration = emptySinceRef.current == null ? 0 : now - emptySinceRef.current;
      emptySinceRef.current = null;
      setData(text);

      if (text === lastEmittedRef.current) {
        if (emptyDuration >= CLEAR_MS) {
          emitCode(text);
        }
        return;
      }

      emitCode(text);
    } catch (error) {
      console.error('Scanner error:', error);
      onErrorRef.current(error);
    }
  }

  function handleError(error) {
    console.error('Camera error:', error);
    setData('Erro na câmera');
    onErrorRef.current(error);
  }

  return (
    <div className="scan-code">
      <BarcodeScanner
        width={320}
        height={240}
        onUpdate={handleUpdate}
        onError={handleError}
        delay={250}
        facingMode="environment"
      />
      <p className="barcode-scan-message">{data}</p>
    </div>
  );
}

export default ScanCode;
