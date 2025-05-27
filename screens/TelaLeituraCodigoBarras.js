import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// Código de barras do crachá autorizado por padrão
const CRACHA_AUTORIZADO_PADRAO = '123456789';
const { width, height } = Dimensions.get('window');

// Definir dimensões do viewfinder aqui para que estejam disponíveis para scanLineStyle
const viewfinderWidth = width * 0.8;
const viewfinderHeight = height * 0.3;
const cornerSize = 30;
const cornerBorderWidth = 5;

export default function TelaLeituraCodigoBarras() {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook para verificar se a tela está em foco
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showUnauthorizedMessage, setShowUnauthorizedMessage] = useState(false);
  const unauthorizedTimerRef = useRef(null); // Ref para o timer
  const [cameraKey, setCameraKey] = useState(Date.now()); // Para forçar o remount da CameraView

  // Animação da linha de scan
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Solicitar permissão da câmera quando o componente montar ou o usuário focar na tela
    if (isFocused && !permission?.granted) {
      requestPermission();
    }
    // Limpar o timer quando o componente é desmontado ou perde foco
    return () => {
      if (unauthorizedTimerRef.current) {
        clearTimeout(unauthorizedTimerRef.current);
      }
      stopScanLineAnimation();
    };
  }, [isFocused, permission]);

  const startScanLineAnimation = () => {
    scanLineAnimation.setValue(0); // Reseta a posição da linha
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopScanLineAnimation = () => {
    scanLineAnimation.stopAnimation();
  };

  const allowNewScanAttempt = () => {
    if (unauthorizedTimerRef.current) {
      clearTimeout(unauthorizedTimerRef.current);
      unauthorizedTimerRef.current = null;
    }
    setShowUnauthorizedMessage(false);
    setScanned(false);
    setCameraKey(Date.now()); // Mudar a key força o remount da CameraView
    if (isFocused && permission?.granted) {
      startScanLineAnimation(); // Reinicia a animação de scan
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;

    setScanned(true);
    setShowUnauthorizedMessage(false);
    console.log(`Código de barras escaneado: Tipo: ${type}, Dado: ${data}`);

    if (data === CRACHA_AUTORIZADO_PADRAO) {
      Alert.alert(
        'Crachá Autorizado',
        'Acesso permitido para adicionar ferramenta.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('AdicionarFerramenta');
            }
          }
        ],
        { cancelable: false } // Impede que o alerta seja dispensado tocando fora
      );
    } else {
      setShowUnauthorizedMessage(true);
      Alert.alert(
        'Crachá Não Autorizado',
        'Este crachá não tem permissão. Código lido: ' + data,
        [
          {
            text: 'Tentar Novamente',
            onPress: allowNewScanAttempt
          },
          {
            text: 'Cancelar',
            onPress: () => {
              if (unauthorizedTimerRef.current) {
                clearTimeout(unauthorizedTimerRef.current);
              }
              navigation.goBack();
            },
            style: 'cancel'
          }
        ],
        { cancelable: false }
      );
      if (unauthorizedTimerRef.current) {
        clearTimeout(unauthorizedTimerRef.current);
      }
      unauthorizedTimerRef.current = setTimeout(() => {
        allowNewScanAttempt();
        unauthorizedTimerRef.current = null;
      }, 7000); // Aumentado para 7 segundos para dar tempo de ler o alerta
    }
  };

  if (!permission) {
    // Permissões ainda estão carregando
    return <View style={styles.containerCenter}><Text style={styles.infoText}>Solicitando permissão da câmera...</Text></View>;
  }

  if (!permission.granted) {
    // Permissões não foram concedidas
    return (
      <View style={styles.containerCenter}>
        <Ionicons name="warning-outline" size={50} color="#FFA500" />
        <Text style={styles.infoText}>Precisamos da sua permissão para usar a câmera.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Se a tela não estiver em foco, não renderizar a câmera para economizar recursos
  if (!isFocused) {
    return <View style={styles.containerCenter}><Text style={styles.infoText}>Aguardando foco na tela...</Text></View>;
  }

  const scanLineStyle = {
    transform: [
      {
        translateY: scanLineAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-viewfinderHeight / 2 + 5, viewfinderHeight / 2 - 5], // Movimenta dentro do viewfinder
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <CameraView
        key={cameraKey}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13", "ean8",
            "upc_a", "upc_e",
            "code39", "code93", "code128",
            "itf14", "codabar",
            "qr" // Mantido caso queira escanear QR Codes também em outros contextos
          ],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.scanMarkerContainer}>
          <View style={styles.scanMarker}>
            {/* Linha de scan (opcional, para visualização) */}
            {/* <View style={styles.scanLine} /> */}
            <Ionicons name="scan-outline" size={Dimensions.get('window').width * 0.8} color="rgba(255,255,255,0.3)" />
          </View>
        </View>
        <Text style={styles.instructionText}>
          Aponte a câmera para o CÓDIGO DE BARRAS do crachá
        </Text>
        {showUnauthorizedMessage && (
          <View style={styles.unauthorizedContainer}>
            <Ionicons name="close-circle-outline" size={30} color="#FF6B6B" />
            <Text style={styles.unauthorizedText}>Crachá não autorizado!</Text>
          </View>
        )}
        <TouchableOpacity style={styles.cancelButtonBottom} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: 20,
  },
  infoText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#38A169',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonCancel: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30,
    paddingBottom: 50,
  },
  scanMarkerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanMarker: {
    width: Dimensions.get('window').width * 0.85, // Aumentar um pouco a área do marcador
    height: Dimensions.get('window').height * 0.3, // Altura retangular para códigos de barras
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(255,255,255,0.05)', // Para visualizar a área de scan
    // borderRadius: 10,
  },
  // Estilo para uma linha de scan (opcional)
  /* scanLine: {
    width: '90%',
    height: 2,
    backgroundColor: 'red',
    position: 'absolute',
    // Animação pode ser adicionada aqui
  }, */
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Fundo mais escuro para melhor contraste
    paddingHorizontal: 15,
    paddingVertical: 10, // Aumentar padding vertical
    borderRadius: 8,
    marginBottom: 20,
  },
  unauthorizedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.85)', // Mais opaco
    paddingHorizontal: 15, // Aumentar padding
    paddingVertical: 12,
    borderRadius: 8,
    position: 'absolute',
    bottom: 120,
  },
  unauthorizedText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  cancelButtonBottom: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 50,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
