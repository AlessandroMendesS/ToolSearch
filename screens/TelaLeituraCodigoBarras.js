import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';

// Lista de códigos de barras autorizados (professores) 
// Em um ambiente real, isso viria do banco de dados
const CODIGOS_AUTORIZADOS = [
  '123456789',   // Professor 1
  '987654321',   // Professor 2
  '112233445',   // Professor 3
];

export default function TelaLeituraCodigoBarras({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pedir permissão para usar a câmera quando o componente for montado
  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Função que lida com o código de barras quando ele é lido
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setLoading(true);
    
    try {
      // Simular uma verificação com o backend (em produção, isso seria uma requisição)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o código está na lista de códigos autorizados
      if (CODIGOS_AUTORIZADOS.includes(data)) {
        // Código autorizado, permitir acesso
        Alert.alert('Acesso Autorizado', 'Bem-vindo, Professor!');
        navigation.replace('AdicionarFerramenta'); // Navegar para a tela de adicionar ferramenta
      } else {
        // Código não autorizado
        Alert.alert('Acesso Negado', 'Somente professores autorizados podem adicionar ferramentas.', [
          { 
            text: 'Tentar Novamente', 
            onPress: () => {
              setScanned(false);
              setLoading(false);
            }
          },
          {
            text: 'Voltar',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Houve um erro ao verificar o código.');
      console.error('Erro na verificação do código:', error);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar diferentes conteúdos com base no estado das permissões
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permissão para a câmera...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Acesso à câmera negado.</Text>
        <Text style={styles.subText}>
          Para acessar esta funcionalidade, você precisa permitir o acesso à câmera 
          nas configurações do seu dispositivo.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.overlay}>
        <Text style={styles.headerText}>Autenticação de Professor</Text>
        <View style={styles.scanArea} />
        <Text style={styles.instructionText}>
          Posicione o código de barras do seu crachá dentro da área de leitura
        </Text>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Verificando...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  scanArea: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#2e7d32',
    borderRadius: 12,
    marginBottom: 30,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 30,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
  subText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 40,
  },
});
