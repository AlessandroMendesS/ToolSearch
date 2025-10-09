import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import supabase from '../api/supabaseClient';
import { useTheme } from '../context/ThemeContext';

export default function LerQRCodes() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidAlertShown, setInvalidAlertShown] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setInvalidAlertShown(false);
    }
  }, [isFocused]);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    try {
      // Aceita formato tool-{patrimonio}-{timestamp}
      const match = data.match(/^tool-(\w+)-\d+$/);
      if (!match) {
        if (!invalidAlertShown) {
          setInvalidAlertShown(true);
          Alert.alert('QR Code inválido', 'O QR Code não está no formato esperado.');
        }
        setLoading(false);
        return;
      }
      setInvalidAlertShown(false);
      const patrimonio = match[1];
      // Buscar dados da ferramenta no Supabase pelo patrimonio
      const { data: ferramenta, error } = await supabase
        .from('ferramentas')
        .select('*')
        .eq('patrimonio', patrimonio)
        .single();
      if (error || !ferramenta) {
        Alert.alert('Erro', 'Ferramenta não encontrada.');
        setLoading(false);
        setScanned(false);
        return;
      }
      // Navegar para a tela de detalhes da ferramenta
      navigation.navigate('DetalheFerramenta', { ferramenta });
    } catch (err) {
      Alert.alert('Erro', 'Falha ao processar o QR Code.');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.text }}>Solicitando permissão da câmera...</Text></View>;
  }
  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
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
    return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.text }}>Aguardando foco na tela...</Text></View>;
  }
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={theme.text} />
      </TouchableOpacity>
      <Text style={[styles.instructionText, { color: theme.text }]}>Aponte para o QR Code da ferramenta</Text>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Buscando ferramenta...</Text>
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
  center: {
    flex: 1,
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
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 110,
    marginBottom: 20,
    zIndex: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
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
