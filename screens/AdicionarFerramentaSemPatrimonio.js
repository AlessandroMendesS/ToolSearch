import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Modal, FlatList, Alert,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as atob } from 'base-64';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import supabase from '../api/supabaseClient';

const categoriasLista = [
  { id: '1', nome: 'Furadeiras', icone: 'build-outline' },
  { id: '2', nome: 'Chaves', icone: 'key-outline' },
  { id: '3', nome: 'Alicates', icone: 'cut-outline' },
  { id: '4', nome: 'Medidores', icone: 'speedometer-outline' },
  { id: '5', nome: 'Serras', icone: 'construct-outline' },
  { id: '6', nome: 'Outros', icone: 'ellipsis-horizontal-circle-outline' },
];

const InputField = ({ icon, placeholder, value, onChangeText, keyboardType = 'default', multiline = false, numberOfLines = 1 }) => (
  <View style={styles.inputContainer}>
    <Ionicons name={icon} size={22} color="#7DA38C" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#A0AEC0"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

export default function AdicionarFerramentaSemPatrimonio() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [imagem, setImagem] = useState(null);
  const [nome, setNome] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [local, setLocal] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });

  const [categoriaModalVisivel, setCategoriaModalVisivel] = useState(false);
  const [imagemModalVisivel, setImagemModalVisivel] = useState(false);

  // Compatibilidade entre versões do expo-image-picker
  const MEDIA_IMAGES = (ImagePicker && ImagePicker.MediaType && (ImagePicker.MediaType.Images || ImagePicker.MediaType.Image))
    || (ImagePicker && ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images);

  const sanitizeFileName = (name) => {
    try {
      const base = (name || 'imagem')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^a-zA-Z0-9._-]/g, '_') 
        .toLowerCase();
      return base.length > 0 ? base : `img`;
    } catch (e) {
      return 'img';
    }
  };

  const tirarFoto = async () => {
    try {
      const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão Necessária', 'Você precisa conceder permissão à câmera para tirar fotos.');
          return;
        }
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: MEDIA_IMAGES,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      setImagemModalVisivel(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagem(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir a câmera: ' + error.message);
      setImagemModalVisivel(false);
    }
  };

  const escolherDaGaleria = async () => {
    try {
      const libraryPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (libraryPermission.status !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão Necessária', 'Você precisa conceder permissão à galeria para escolher uma foto.');
          return;
        }
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: MEDIA_IMAGES,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      setImagemModalVisivel(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagem(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar acessar a galeria: ' + error.message);
      setImagemModalVisivel(false);
    }
  };

  const validarFormulario = () => {
    if (!nome.trim()) { 
      Alert.alert('Campo Obrigatório', 'Por favor, insira o nome da ferramenta.'); 
      return false; 
    }
    if (!local.trim()) { 
      Alert.alert('Campo Obrigatório', 'Insira o local de armazenamento.'); 
      return false; 
    }
    if (!categoriaSelecionada) { 
      Alert.alert('Campo Obrigatório', 'Selecione uma categoria.'); 
      return false; 
    }
    
    const qtd = parseInt(quantidade) || 0;
    if (qtd < 1) { Alert.alert('Quantidade Inválida', 'A quantidade deve ser pelo menos 1.'); return false; }
    if (qtd > 100) { Alert.alert('Quantidade Inválida', 'A quantidade máxima é 100 por vez.'); return false; }
    
    return true;
  };

  const handleVoltar = () => {
    navigation.goBack();
  };

  // Gerar um patrimônio único baseado em timestamp e random
  // Para ferramentas sem patrimônio, o valor será "SEM PATRIMONIO" com sufixo único
  const gerarPatrimonioUnico = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `SEM PATRIMONIO-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;
    
    const qtd = parseInt(quantidade) || 1;
    
    setLoading(true);
    setProgresso({ atual: 0, total: qtd });
    
    let imagemUrlSupabase = null;

    // Upload da imagem apenas uma vez (se houver)
    if (imagem) {
      try {
        const imagemNomeUnico = `${Date.now()}_${sanitizeFileName(nome)}.jpg`;
        
        // Ler arquivo local em base64 e converter para ArrayBuffer
        const base64 = await FileSystem.readAsStringAsync(imagem, { encoding: 'base64' });
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const buffer = bytes.buffer;

        // Upload para o bucket padronizado
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ferramentas-imagens')
          .upload(imagemNomeUnico, buffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          throw uploadError;
        }

        // Obter a URL pública correta
        const { data: publicUrlData, error: publicUrlError } = supabase.storage
          .from('ferramentas-imagens')
          .getPublicUrl(imagemNomeUnico);

        if (publicUrlError) {
          throw publicUrlError;
        }

        imagemUrlSupabase = publicUrlData.publicUrl;
      } catch (error) {
        console.error('Erro detalhado no upload:', error);
        Alert.alert('Erro no Upload', 'Não foi possível fazer o upload da imagem. Mensagem: ' + error.message);
        setLoading(false);
        setProgresso({ atual: 0, total: 0 });
        return;
      }
    }

    // Criar array de ferramentas com patrimônios únicos
    const ferramentasParaCriar = [];
    for (let i = 0; i < qtd; i++) {
      const patrimonioUnico = gerarPatrimonioUnico();
      ferramentasParaCriar.push({
        nome,
        patrimonio: patrimonioUnico,
        detalhes,
        local,
        categoria_id: categoriaSelecionada.id,
        categoria_nome: categoriaSelecionada.nome,
        imagem_url: imagemUrlSupabase,
        qrcode_url: `tool-${patrimonioUnico}-${Date.now()}-${i}`,
        disponivel: true,
        adicionado_por: user?.id || 1,
      });
    }

    try {
      // Inserir todas as ferramentas de uma vez (mais eficiente)
      setProgresso({ atual: qtd, total: qtd }); // Mostrar progresso completo ao inserir em lote
      
      const { data, error } = await supabase
        .from('ferramentas')
        .insert(ferramentasParaCriar)
        .select();

      if (error) {
        throw error;
      }

      Alert.alert(
        'Sucesso!', 
        `${qtd} ferramenta${qtd > 1 ? 's' : ''} cadastrada${qtd > 1 ? 's' : ''} com sucesso.`,
        [{ text: 'OK', onPress: handleVoltar }]
      );
      
      // Limpar formulário
      setImagem(null); 
      setNome(''); 
      setDetalhes(''); 
      setLocal(''); 
      setQuantidade('1');
      setCategoriaSelecionada(null);
    } catch (error) {
      console.error('Erro ao salvar ferramenta no DB:', error);
      Alert.alert('Erro ao Salvar', 'Não foi possível salvar a ferramenta no banco de dados: ' + error.message);
    } finally {
      setLoading(false);
      setProgresso({ atual: 0, total: 0 });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleVoltar} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#38A169" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nova Ferramenta</Text>
          </View>

          <TouchableOpacity style={styles.imagePicker} onPress={() => setImagemModalVisivel(true)}>
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={40} color="#7DA38C" />
                <Text style={styles.imagePickerText}>Adicionar Foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <InputField icon="hammer-outline" placeholder="Ex: Chave de fenda Phillips" value={nome} onChangeText={setNome} />
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#38A169" />
            <Text style={styles.infoText}>
              Um número de patrimônio será gerado automaticamente para esta ferramenta.
            </Text>
          </View>

          <InputField icon="copy-outline" placeholder="Ex: 1 (padrão) ou 5" value={quantidade} onChangeText={(text) => {
            // Permitir apenas números e permitir campo vazio
            const num = text.replace(/[^0-9]/g, '');
            setQuantidade(num);
          }} keyboardType="numeric" />
          
          {quantidade && parseInt(quantidade) > 1 && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#38A169" />
              <Text style={styles.infoText}>
                {`Serão criadas ${quantidade} ferramentas com patrimônios únicos gerados automaticamente.`}
              </Text>
            </View>
          )}
          
          {loading && progresso.total > 0 && (
            <View style={styles.progressBox}>
              <Text style={styles.progressText}>
                Cadastrando {progresso.atual} de {progresso.total}...
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(progresso.atual / progresso.total) * 100}%` }]} />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.inputContainer} onPress={() => setCategoriaModalVisivel(true)}>
            <Ionicons name="layers-outline" size={22} color="#7DA38C" style={styles.inputIcon} />
            <Text style={[styles.input, categoriaSelecionada ? {} : { color: '#A0AEC0' }]}>
              {categoriaSelecionada ? categoriaSelecionada.nome : 'Selecionar Categoria'}
            </Text>
            <Ionicons name="chevron-down" size={22} color="#7DA38C" />
          </TouchableOpacity>

          <InputField icon="information-circle-outline" placeholder="Ex: Ponta Phillips nº 2, cabo emborrachado" value={detalhes} onChangeText={setDetalhes} multiline numberOfLines={3} />
          <InputField icon="location-outline" placeholder="Ex: Bancada 1, Gaveta A" value={local} onChangeText={setLocal} />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Salvar Ferramenta</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal para escolher Categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoriaModalVisivel}
        onRequestClose={() => setCategoriaModalVisivel(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setCategoriaModalVisivel(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione a Categoria</Text>
            <FlatList
              data={categoriasLista}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => { setCategoriaSelecionada(item); setCategoriaModalVisivel(false); }}
                >
                  <Ionicons name={item.icone} size={24} color="#38A169" style={{ marginRight: 15 }} />
                  <Text style={styles.modalItemText}>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setCategoriaModalVisivel(false)}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal para escolher Imagem */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imagemModalVisivel}
        onRequestClose={() => setImagemModalVisivel(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setImagemModalVisivel(false)}>
          <View style={[styles.modalContent, styles.imageModalContent]}>
            <Text style={styles.modalTitle}>Adicionar Foto</Text>
            <TouchableOpacity style={styles.imageOptionButton} onPress={tirarFoto}>
              <Ionicons name="camera-outline" size={24} color="#38A169" />
              <Text style={styles.imageOptionText}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageOptionButton} onPress={escolherDaGaleria}>
              <Ionicons name="image-outline" size={24} color="#38A169" />
              <Text style={styles.imageOptionText}>Escolher da Galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setImagemModalVisivel(false)}>
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 15,
  },
  imagePicker: {
    height: 180,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 8,
    color: '#38A169',
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 15,
    marginBottom: 15,
    minHeight: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: '#38A169',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: "#2F855A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  imageModalContent: {
    maxHeight: '40%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  progressBox: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressText: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38A169',
    borderRadius: 4,
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  imageOptionText: {
    fontSize: 17,
    color: '#333',
    marginLeft: 15,
  },
  modalCloseButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#38A169',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
});

