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
  Easing,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

// Código de barras do crachá autorizado por padrão
const CRACHA_AUTORIZADO_PADRAO = '123456789';
const { width, height } = Dimensions.get('window');

// Definir dimensões do viewfinder aqui para que estejam disponíveis para scanLineStyle
const viewfinderWidth = width * 0.8;
const viewfinderHeight = height * 0.3;
const cornerSize = 30;
const cornerBorderWidth = 5;

export default function TelaLeituraCodigoBarras() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook para verificar se a tela está em foco
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showUnauthorizedMessage, setShowUnauthorizedMessage] = useState(false);
  const unauthorizedTimerRef = useRef(null); // Ref para o timer
  const [cameraKey, setCameraKey] = useState(Date.now()); // Para forçar o remount da CameraView

  // Animação da linha de scan
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  // Reset completo quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('Tela ganhou foco - resetando scanner');
      resetScanner();
      return () => {
        console.log('Tela perdeu foco');
        if (unauthorizedTimerRef.current) {
          clearTimeout(unauthorizedTimerRef.current);
        }
        stopScanLineAnimation();
      };
    }, [])
  );

  useEffect(() => {
    // Solicitar permissão da câmera quando o componente montar
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const resetScanner = () => {
    console.log('Resetando scanner...');
    setScanned(false);
    setShowUnauthorizedMessage(false);
    if (unauthorizedTimerRef.current) {
      clearTimeout(unauthorizedTimerRef.current);
      unauthorizedTimerRef.current = null;
    }
    setCameraKey(Date.now());
    if (permission?.granted) {
      startScanLineAnimation();
    }
  };

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
    console.log('Permitindo nova tentativa de scan');
    resetScanner();
  };

  const handleBarCodeScanned = ({ type, data }) => {
    console.log('Tentando ler código de barras...', { scanned, type, data });
    
    if (scanned) {
      console.log('Scanner já foi usado, ignorando...');
      return;
    }

    console.log(`Código de barras escaneado: Tipo: ${type}, Dado: ${data}`);
    setScanned(true);
    setShowUnauthorizedMessage(false);

    if (data === CRACHA_AUTORIZADO_PADRAO) {
      console.log('Navegando para SelecionarTipoFerramenta');
      navigation.navigate('SelecionarTipoFerramenta');
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
      }, 7000);
    }
  };

  if (!permission) {
    return <View style={[styles.containerCenter, { backgroundColor: theme.background }]}><Text style={[styles.infoText, { color: theme.text }]}>Solicitando permissão da câmera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.containerCenter, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
        <Ionicons name="warning-outline" size={50} color={theme.error} />
        <Text style={[styles.infoText, { color: theme.text }]}>Precisamos da sua permissão para usar a câmera.</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={requestPermission}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Conceder Permissão</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonCancel, { backgroundColor: theme.error }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isFocused) {
    return <View style={[styles.containerCenter, { backgroundColor: theme.background }]}><Text style={[styles.infoText, { color: theme.text }]}>Aguardando foco na tela...</Text></View>;
  }

  const scanLineStyle = {
    transform: [
      {
        translateY: scanLineAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-viewfinderHeight / 2 + 5, viewfinderHeight / 2 - 5],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      {/* Botão de voltar flutuante */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>

      {/* Botão de reset manual */}
      <TouchableOpacity style={styles.resetButton} onPress={allowNewScanAttempt}>
        <Ionicons name="refresh" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Status do scanner */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: theme.text, backgroundColor: theme.card }]}>
          Status: {scanned ? 'Aguardando reset' : 'Pronto para scan'}
        </Text>
      </View>

      {/* Instrução e ícone */}
      <View style={styles.instructionContainer}>
        <MaterialCommunityIcons name="barcode-scan" size={48} color="#fff" style={{ marginBottom: 8 }} />
        <Text style={styles.instructionText}>Aponte para o código de barras do crachá para adicionar a ferramenta</Text>
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
          <View style={[styles.viewfinder, { borderColor: theme.primary }]}>
            {/* Cantos coloridos */}
            <View style={[styles.corner, styles.topLeft, { borderColor: theme.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: theme.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: theme.primary }]} />
            {/* Linha de scan animada */}
            <Animated.View style={[styles.scanLine, scanLineStyle, { backgroundColor: theme.primary }]} />
          </View>
        </View>
      </View>
      {/* Mensagem de não autorizado */}
      {showUnauthorizedMessage && (
        <View style={styles.unauthorizedMessageContainer}>
          <Text style={[styles.unauthorizedMessageText, { backgroundColor: theme.error, color: theme.buttonText }]}>Crachá não autorizado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: 6,
  },
  resetButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: 6,
  },
  statusContainer: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    zIndex: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    
  },
  instructionContainer: {
    position: 'absolute',
    top: 130,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
    
  },
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 98, 98, 0.45)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: cornerSize,
    height: cornerSize,
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
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonCancel: {
    marginTop: 10,
  },
});
