import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, 
  StatusBar, Animated, Dimensions, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import supabase from '../api/supabaseClient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
// Viewfinder quadrado para QR Code (similar proporção ao código de barras)
const viewfinderSize = width * 0.7;
const cornerSize = 30;
const cornerBorderWidth = 5;

export default function LerQRCodes() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidAlertShown, setInvalidAlertShown] = useState(false);
  
  // Animação da linha de scan
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setInvalidAlertShown(false);
      if (permission?.granted) {
        startScanLineAnimation();
      }
    }
    return () => {
      stopScanLineAnimation();
    };
  }, [isFocused, permission]);

  const startScanLineAnimation = () => {
    scanLineAnimation.setValue(0);
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

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    try {
      // Verificar se começa com "tool-"
      if (!data.startsWith('tool-')) {
        if (!invalidAlertShown) {
          setInvalidAlertShown(true);
          Alert.alert('QR Code inválido', 'O QR Code não está no formato esperado.');
        }
        setLoading(false);
        setScanned(false);
        return;
      }
      setInvalidAlertShown(false);
      
      // Primeiro, tentar buscar pelo qrcode_url completo (mais confiável)
      let { data: ferramenta, error } = await supabase
        .from('ferramentas')
        .select('*')
        .eq('qrcode_url', data)
        .single();
      
      // Se não encontrou pelo qrcode_url, tentar extrair o patrimônio
      if (error || !ferramenta) {
        // Extrair patrimônio do formato: tool-{patrimonio}-{timestamp} ou tool-{patrimonio}-{timestamp}-{index}
        // Dividir por hífens
        const parts = data.split('-');
        
        if (parts.length < 3) {
          Alert.alert('Erro', 'Formato de QR Code inválido.');
          setLoading(false);
          setScanned(false);
          return;
        }
        
        // Remover "tool" (primeiro elemento)
        parts.shift();
        
        // O formato é: {patrimonio}-{timestamp} ou {patrimonio}-{timestamp}-{index}
        // O timestamp é sempre o penúltimo ou último elemento (se houver index)
        // E o index (se existir) é sempre o último elemento e é um número pequeno (0-999)
        
        // Estratégia: tentar diferentes combinações de patrimônio
        // Começar do final e ir removendo elementos até encontrar uma ferramenta
        
        let ferramentaEncontrada = null;
        
        // Tentar diferentes combinações: remover os últimos elementos (timestamp e index)
        for (let removeCount = 1; removeCount <= Math.min(parts.length - 1, 3); removeCount++) {
          const patrimonioParts = parts.slice(0, parts.length - removeCount);
          const patrimonio = patrimonioParts.join('-');
          
          if (patrimonio) {
            const { data: ferramentaTeste, error: errorTeste } = await supabase
              .from('ferramentas')
              .select('*')
              .eq('patrimonio', patrimonio)
              .limit(1);
            
            if (!errorTeste && ferramentaTeste && ferramentaTeste.length > 0) {
              ferramentaEncontrada = ferramentaTeste[0];
              break;
            }
          }
        }
        
        if (!ferramentaEncontrada) {
          Alert.alert('Erro', 'Ferramenta não encontrada.');
          setLoading(false);
          setScanned(false);
          return;
        }
        
        ferramenta = ferramentaEncontrada;
      }
      
      // Navegar para a tela de detalhes da ferramenta
      navigation.navigate('DetalheFerramenta', { ferramenta });
    } catch (err) {
      console.error('Erro ao processar QR Code:', err);
      Alert.alert('Erro', 'Falha ao processar o QR Code.');
      setScanned(false);
    } finally {
      setLoading(false);
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
          outputRange: [-viewfinderSize / 2 + 5, viewfinderSize / 2 - 5],
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

      {/* Status do scanner */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: theme.text, backgroundColor: theme.card }]}>
          Status: {scanned ? 'Processando...' : 'Pronto para scan'}
        </Text>
      </View>

      {/* Instrução e ícone */}
      <View style={styles.instructionContainer}>
        <Ionicons name="qr-code-outline" size={48} color="#fff" style={{ marginBottom: 8 }} />
        <Text style={styles.instructionText}>Aponte para o QR Code da ferramenta</Text>
      </View>

      {/* Overlay escurecido com viewfinder destacado */}
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
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

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Buscando ferramenta...</Text>
          </View>
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
    width: viewfinderSize,
    height: viewfinderSize,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
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
