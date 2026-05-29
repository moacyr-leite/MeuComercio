import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Scanner({ onScanSuccess, onScanError }) {
  const [scannerId] = useState(`scanner-${Math.random().toString(36).substr(2, 9)}`);
  
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(scannerId, {
      qrbox: {
        width: 250,
        height: 150,
      },
      fps: 10,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
    }, false);

    scanner.render(
      (decodedText) => {
        // Para evitar múltiplas leituras sucessivas do mesmo código
        scanner.pause();
        onScanSuccess(decodedText);
        setTimeout(() => scanner.resume(), 2000);
      },
      (errorMessage) => {
        if (onScanError) onScanError(errorMessage);
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [scannerId, onScanSuccess, onScanError]);

  return <div id={scannerId} style={{ width: '100%', margin: '0 auto' }}></div>;
}
