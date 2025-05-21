import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Lista de códigos de barras autorizados (professores) 
// Em um ambiente real, isso viria do banco de dados
const CODIGOS_AUTORIZADOS = [
  '123456789',   // Professor 1
  '987654321',   // Professor 2
  '112233445',   // Professor 3
];

export default function TelaLeituraCodigoBarras({ navigation }) {
  const [codigoManual, setCodigoManual] = useState('');
  const [loading, setLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  // Simular o carregamento inicial da câmera
  useEffect(() => {
    // Mostrar interface de entrada manual após um tempo
    // Para simular a falha do scanner
    const timer = setTimeout(() => {
      setShowManualInput(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Função para validar o código inserido manualmente
  const verificarCodigo = async (codigo) => {
    setLoading(true);

    try {
      // Simular uma verificação com o backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se o código está na lista de códigos autorizados
      if (CODIGOS_AUTORIZADOS.includes(codigo)) {
        // Código autorizado, permitir acesso
        Alert.alert('Acesso Autorizado', 'Bem-vindo, Professor!');
        navigation.navigate('AdicionarFerramenta'); // Usar navigate em vez de replace
      } else {
        // Código não autorizado
        Alert.alert(
          'Acesso Negado',
          'Somente professores autorizados podem adicionar ferramentas.',
          [{ text: 'OK', onPress: () => setCodigoManual('') }]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Houve um erro ao verificar o código.');
      console.error('Erro na verificação do código:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a submissão do código manual
  const handleSubmitCodigo = () => {
    if (codigoManual.trim().length > 0) {
      verificarCodigo(codigoManual);
    } else {
      Alert.alert('Erro', 'Por favor, digite um código válido.');
    }
  };

  // Para facilitar o desenvolvimento, podemos incluir uma função 
  // para autenticar rapidamente com um código válido
  const autenticarRapido = () => {
    setCodigoManual(CODIGOS_AUTORIZADOS[0]);
    verificarCodigo(CODIGOS_AUTORIZADOS[0]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.headerText}>Autenticação de Professor</Text>

        {!showManualInput ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>
              Tentando acessar a câmera...
            </Text>
          </View>
        ) : (
          <View style={styles.manualInputContainer}>
            <View style={styles.cameraErrorContainer}>
              <Ionicons name="camera-off" size={48} color="#ff6b6b" />
              <Text style={styles.cameraErrorText}>
                Não foi possível acessar a câmera
              </Text>
              <Text style={styles.cameraErrorSubtext}>
                Por favor, use a entrada manual abaixo
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Digite o código do seu crachá"
              placeholderTextColor="#aaa"
              value={codigoManual}
              onChangeText={setCodigoManual}
              keyboardType="number-pad"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitCodigo}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Text>
              {loading && <ActivityIndicator color="#fff" style={{ marginLeft: 10 }} />}
            </TouchableOpacity>

            {__DEV__ && (
              <TouchableOpacity
                style={styles.devButton}
                onPress={autenticarRapido}
              >
                <Text style={styles.devButtonText}>
                  [DEV] Autenticar Automaticamente
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>
                Voltar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && !showManualInput && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Verificando...</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F07',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  manualInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  cameraErrorContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cameraErrorText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cameraErrorSubtext: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    borderRadius: 8,
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 12,
    marginTop: 10,
  },
  backButtonText: {
    color: '#a0c8b0',
    fontSize: 16,
  },
  devButton: {
    backgroundColor: '#bf4d00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  devButtonText: {
    color: 'white',
    fontSize: 14,
  }
});
