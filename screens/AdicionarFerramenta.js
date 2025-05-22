import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Modal, FlatList, Alert,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import supabase from '../api/supabaseClient';

const grupos = [
  { id: '1', nome: 'Furadeiras', imagem: require('../assets/img/furadeira.png') },
  { id: '2', nome: 'Chaves', imagem: require('../assets/img/chaves.png') },
  { id: '3', nome: 'Alicates', imagem: require('../assets/img/alicates.png') },
  { id: '4', nome: 'Medidores', imagem: null },
  { id: '5', nome: 'Serras', imagem: null },
  { id: '6', nome: 'Outros', imagem: null },
];

export default function AdicionarFerramenta() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [nome, setNome] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [local, setLocal] = useState('');
  const [patrimonio, setPatrimonio] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);

  // Solicitar permissões ao carregar o componente
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === 'granted');

      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);

  // Função para selecionar imagem da câmera
  const tirarFoto = async () => {
    if (!cameraPermission) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos da permissão da câmera para continuar.',
        [{ text: 'OK' }]
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagem(result.assets[0].uri);
    }
  };

  // Função para selecionar imagem da galeria
  const escolherImagem = async () => {
    if (!galleryPermission) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos da permissão da galeria para continuar.',
        [{ text: 'OK' }]
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagem(result.assets[0].uri);
    }
  };

  // Modal para escolha da fonte da imagem
  const [imagemModalVisivel, setImagemModalVisivel] = useState(false);

  // Função para gerar um QR Code simulado
  const gerarQRCode = () => {
    setQrCodePreview(true);

    // ID único para o QR code baseado em timestamp
    const qrCodeId = `qrcode-${Date.now()}`;

    // Mostrar por 3 segundos e depois fechar
    setTimeout(() => {
      setQrCodePreview(false);
      Alert.alert(
        'QR Code gerado',
        `Um QR code único foi gerado para esta ferramenta.\n\nID: ${qrCodeId}\n\nEste ID pode ser usado para rastrear a ferramenta posteriormente.`,
        [{ text: 'OK' }]
      );
    }, 2000);

    return qrCodeId;
  };

  // Função para validar o formulário
  const validarFormulario = () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome da ferramenta');
      return false;
    }

    if (!patrimonio.trim()) {
      Alert.alert('Erro', 'Por favor, informe o número de patrimônio');
      return false;
    }

    if (!local.trim()) {
      Alert.alert('Erro', 'Por favor, informe o local da ferramenta');
      return false;
    }

    if (!categoria) {
      Alert.alert('Erro', 'Por favor, selecione uma categoria');
      return false;
    }

    return true;
  };

  // Função para salvar a ferramenta no Supabase
  const salvarFerramenta = async (ferramenta) => {
    try {
      console.log('Tentando salvar ferramenta no Supabase');

      // Construir objeto para inserção
      const novaTool = {
        nome: ferramenta.nome,
        patrimonio: ferramenta.patrimonio,
        detalhes: ferramenta.detalhes || '',
        local: ferramenta.local,
        categoria_id: ferramenta.categoria_id,
        categoria_nome: ferramenta.categoria_nome,
        imagem_url: ferramenta.imagem_url || null,
        qrcode_url: ferramenta.qrcode_url,
        disponivel: true,
        adicionado_por: 1 // ID fixo para desenvolvimento
      };

      // Inserir no Supabase
      const { data, error } = await supabase
        .from('ferramentas')
        .insert([novaTool]);

      // Verificar erro
      if (error) {
        console.error('Erro ao salvar ferramenta:', error);
        Alert.alert('Erro', 'Não foi possível salvar a ferramenta: ' + error.message);
        return false;
      }

      console.log('Ferramenta salva com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao salvar.');
      return false;
    }
  };

  // Função para lidar com a submissão do formulário
  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      // Gerar um QR Code
      const qrCodeId = gerarQRCode();

      // Criar objeto da ferramenta
      const novaFerramenta = {
        nome,
        detalhes,
        local,
        patrimonio,
        categoria_id: categoria.id,
        categoria_nome: categoria.nome,
        imagem_url: imagem,
        qrcode_url: qrCodeId,
        disponivel: true,
        data_criacao: new Date().toISOString()
      };

      // Salvar no Supabase
      const sucesso = await salvarFerramenta(novaFerramenta);

      if (sucesso) {
        setLoading(false);
        Alert.alert(
          'Sucesso',
          'Ferramenta cadastrada com sucesso no Supabase!',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                navigation.navigate('Início');
              }
            }
          ]
        );
      } else {
        setLoading(false);
        Alert.alert('Erro', 'Erro ao cadastrar ferramenta. Tente novamente.');
      }
    } catch (error) {
      setLoading(false);
      console.error("Erro ao cadastrar ferramenta:", error);
      Alert.alert('Erro', 'Erro ao cadastrar ferramenta. Tente novamente.');
    }
  };

  // Função para selecionar categoria
  const selecionarCategoria = (grupo) => {
    setCategoria(grupo);
    setModalVisivel(false);
  };

  // Função para resetar o formulário
  const resetForm = () => {
    setNome('');
    setDetalhes('');
    setLocal('');
    setPatrimonio('');
    setCategoria(null);
    setImagem(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2e7d32" />
        </TouchableOpacity>

      <Text style={styles.titulo}>Adicionar Nova Ferramenta</Text>

      {/* Upload imagem */}
        <TouchableOpacity
          style={styles.uploadArea}
          onPress={() => setImagemModalVisivel(true)}
        >
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.imagemPreview} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={48} color="#a0c8b0" />
              <Text style={styles.uploadText}>Toque para adicionar uma imagem</Text>
            </>
          )}
      </TouchableOpacity>

      {/* Formulário */}
        <Text style={styles.label}>Nome da Ferramenta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Furadeira Elétrica Bosch"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Número de Patrimônio</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 10234"
          value={patrimonio}
          onChangeText={setPatrimonio}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Categoria</Text>
        <TouchableOpacity
          style={styles.categoriaSelector}
          onPress={() => setModalVisivel(true)}
        >
          {categoria ? (
            <View style={styles.categoriaSelected}>
              {categoria.imagem && (
                <Image source={categoria.imagem} style={styles.categoriaImagem} />
              )}
              <Text style={styles.categoriaText}>{categoria.nome}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>Selecione uma categoria</Text>
          )}
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Detalhes</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
          placeholder="Descreva as especificações da ferramenta"
        value={detalhes}
        onChangeText={setDetalhes}
        multiline
      />

        <Text style={styles.label}>Local de Armazenamento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Estoque Principal / Almoxarifado"
          value={local}
          onChangeText={setLocal}
        />

      {/* Botão Submit */}
        <TouchableOpacity
          style={styles.botaoSubmit}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoSubmitText}>
              Cadastrar Ferramenta
            </Text>
          )}
      </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal de escolha de categoria */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione uma categoria</Text>

            <FlatList
              data={grupos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.grupoItem}
                  onPress={() => selecionarCategoria(item)}
                >
                  <View style={styles.grupoImagemContainer}>
                    {item.imagem ? (
                  <Image source={item.imagem} style={styles.grupoImagem} />
                    ) : (
                      <Ionicons name="tools-outline" size={24} color="#2e7d32" />
                    )}
                  </View>
                  <Text style={styles.grupoTexto}>{item.nome}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#2e7d32" />
                  </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de escolha da origem da imagem */}
      <Modal visible={imagemModalVisivel} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar imagem</Text>

            <TouchableOpacity
              style={styles.imagemOption}
              onPress={() => {
                setImagemModalVisivel(false);
                setTimeout(() => tirarFoto(), 300);
              }}
            >
              <Ionicons name="camera" size={24} color="#2e7d32" />
              <Text style={styles.imagemOptionText}>Tirar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imagemOption}
              onPress={() => {
                setImagemModalVisivel(false);
                setTimeout(() => escolherImagem(), 300);
              }}
            >
              <Ionicons name="images" size={24} color="#2e7d32" />
              <Text style={styles.imagemOptionText}>Escolher da galeria</Text>
            </TouchableOpacity>

            {imagem && (
              <TouchableOpacity
                style={[styles.imagemOption, styles.removerImagem]}
                onPress={() => {
                  setImagem(null);
                  setImagemModalVisivel(false);
                }}
              >
                <Ionicons name="trash" size={24} color="#e53935" />
                <Text style={[styles.imagemOptionText, { color: '#e53935' }]}>Remover imagem</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setImagemModalVisivel(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de preview do QR code */}
      {qrCodePreview && (
        <Modal visible={true} animationType="fade" transparent>
          <View style={styles.qrCodeModalContainer}>
            <View style={styles.qrCodeModalContent}>
              <ActivityIndicator size="large" color="#2e7d32" />
              <Text style={styles.qrCodeModalText}>Gerando QR Code...</Text>
            </View>
    </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2e7d32',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    backgroundColor: '#f0f7f0',
    padding: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a0c8b0',
    borderStyle: 'dashed',
    height: 180,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888'
  },
  imagemPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  categoriaSelected: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriaImagem: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  categoriaText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  botaoSubmit: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoSubmitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e7d32',
  },
  grupoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  grupoImagemContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  grupoImagem: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  grupoTexto: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
  imagemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imagemOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  removerImagem: {
    marginTop: 10,
  },
  qrCodeModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCodeModalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeModalText: {
    fontSize: 16,
    marginTop: 20,
    color: '#333',
  },
});