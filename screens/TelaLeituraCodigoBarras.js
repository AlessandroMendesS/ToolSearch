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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
      {/* Botão de voltar flutuante */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Instrução e ícone */}
      <View style={styles.instructionContainer}>
        <MaterialCommunityIcons name="barcode-scan" size={48} color="#fff" style={{ marginBottom: 8 }} />
        <Text style={styles.instructionText}>Aponte para o código de barras do crachá</Text>
      </View>

      {/* Overlay escurecido com viewfinder destacado */}
      <CameraView
        key={cameraKey}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13", "ean8",
            "upc_a", "upc_e",
            "code39", "code93", "code128",
            "itf14", "codabar",
            "qr"
          ],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay} pointerEvents="none">
        {/* Viewfinder */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder}>
            {/* Cantos coloridos */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            {/* Linha de scan animada */}
            <Animated.View style={[styles.scanLine, scanLineStyle]} />
          </View>
        </View>
      </View>
      {/* Mensagem de não autorizado */}
      {showUnauthorizedMessage && (
        <View style={styles.unauthorizedMessageContainer}>
          <Text style={styles.unauthorizedMessageText}>Crachá não autorizado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    padding: 6,
  },
  instructionContainer: {
    position: 'absolute',
    top: 110,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  viewfinderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: viewfinderWidth,
    height: viewfinderHeight,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#00e676',
    backgroundColor: 'rgba(0,0,0,0.15)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: cornerSize,
    height: cornerSize,
    borderColor: '#00e676',
    borderWidth: cornerBorderWidth,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 18,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 18,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 18,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 18,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#00e676',
    opacity: 0.85,
    borderRadius: 2,
  },
  unauthorizedMessageContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  unauthorizedMessageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#00e676',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonCancel: {
    backgroundColor: '#ff5252',
    marginTop: 10,
  },
});
