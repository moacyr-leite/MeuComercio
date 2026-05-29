import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

// Scanner.jsx é responsável por abrir a câmera, pedir permissão ao usuário e ler códigos de barras / QR codes.
// Aqui estão os passos principais que você deve entender e testar:
// 1. Pedir permissão de câmera com BarCodeScanner.requestPermissionsAsync().
// 2. Mostrar mensagem de carregamento enquanto aguarda a resposta.
// 3. Se negar a permissão, exibir erro e chamar onScanError se existir.
// 4. Se permitir, renderizar BarCodeScanner e escutar onBarCodeScanned.
// 5. Quando um código é lido, armazenar o valor, bloquear leituras repetidas e chamar onScanSuccess.
// 6. Permitir escanear novamente depois que o usuário ver o resultado ou usar um botão.
export default function Scanner({ onScanSuccess, onScanError }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Ao montar o componente, solicitamos permissão de câmera uma vez.
    // Se o usuário já tiver concedido permissão no dispositivo, essa chamada ainda garante
    // que o estado seja atualizado corretamente.
    (async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        const granted = status === 'granted';
        setHasPermission(granted);

        if (!granted) {
          const message = 'Permissão de câmera negada.';
          setErrorMessage(message);
          // Informa o componente pai que houve falha na permissão.
          onScanError?.(message);
        }
      } catch (error) {
        const message = 'Falha ao solicitar permissão de câmera.';
        setErrorMessage(message);
        onScanError?.(message);
      }
    })();
  }, [onScanError]);

  const handleBarCodeScanned = ({ data }) => {
    // Se já escaneamos um código, evitamos processar outro imediatamente.
    // Isso impede leituras duplicadas enquanto o usuário ainda está olhando para a câmera.
    if (scanned) return;

    console.log('BarCode lido:', data);
    setScanned(true);
    setLastScannedData(data);
    onScanSuccess?.(data);

    // Opcional: permitir novo escaneamento após 2 segundos.
    // Você pode ajustar esse tempo ou usar um botão para reiniciar manualmente.
    setTimeout(() => setScanned(false), 2000);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Solicitando permissão de câmera...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{errorMessage ?? 'Permissão de câmera necessária.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/*
        O BarCodeScanner ocupa toda a área do componente.
        A propriedade onBarCodeScanned só é passada enquanto não estivermos no estado scanned.
        Isso evita múltiplos disparos seguidos de um mesmo código.
      */}
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Aponte a câmera para o QR code</Text>
        {lastScannedData && (
          <Text style={styles.scannedText}>Último código lido: {lastScannedData}</Text>
        )}

        {/*
          Se um código já foi lido, mostramos um botão para reiniciar o escaneamento.
          Isso é importante em caso de leitura incorreta ou se o usuário quiser escanear outro código.
        */}
        {scanned && (
          <Button title="Escanear novamente" onPress={() => setScanned(false)} />
        )}

        {Platform.OS === 'web' && (
          <Text style={styles.webHint}>No web, permita o uso da câmera no navegador.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 320,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  scannedText: {
    color: '#ccf',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  messageContainer: {
    flex: 1,
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  messageText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  webHint: {
    color: '#ddd',
    marginTop: 8,
    textAlign: 'center',
  },
});
