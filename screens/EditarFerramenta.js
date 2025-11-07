import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Modal, FlatList, Alert,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as atob } from 'base-64';
import { useTheme } from '../context/ThemeContext';
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

export default function EditarFerramenta({ route, navigation }) {
  const { ferramenta: ferramentaInicial } = route.params;
  const { theme } = useTheme();

  const [imagem, setImagem] = useState(ferramentaInicial.imagem_url || null);
  const [imagemNova, setImagemNova] = useState(null); // Nova imagem selecionada
  const [nome, setNome] = useState(ferramentaInicial.nome || '');
  const [detalhes, setDetalhes] = useState(ferramentaInicial.detalhes || '');
  const [local, setLocal] = useState(ferramentaInicial.local || '');
  const [patrimonio, setPatrimonio] = useState(ferramentaInicial.patrimonio || '');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(
    categoriasLista.find(cat => cat.id === ferramentaInicial.categoria_id) || null
  );
  const [loading, setLoading] = useState(false);

  const [categoriaModalVisivel, setCategoriaModalVisivel] = useState(false);
  const [imagemModalVisivel, setImagemModalVisivel] = useState(false);

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
        setImagemNova(result.assets[0].uri);
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
        setImagemNova(result.assets[0].uri);
        setImagem(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar acessar a galeria: ' + error.message);
      setImagemModalVisivel(false);
    }
  };

  const validarFormulario = () => {
    if (!nome.trim()) { Alert.alert('Campo Obrigatório', 'Por favor, insira o nome da ferramenta.'); return false; }
    if (!patrimonio.trim()) { Alert.alert('Campo Obrigatório', 'Insira o número de patrimônio.'); return false; }
    if (!local.trim()) { Alert.alert('Campo Obrigatório', 'Insira o local de armazenamento.'); return false; }
    if (!categoriaSelecionada) { Alert.alert('Campo Obrigatório', 'Selecione uma categoria.'); return false; }
    return true;
  };

  const handleVoltar = () => {
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;
    setLoading(true);
    
    let imagemUrlSupabase = ferramentaInicial.imagem_url; // Manter a imagem atual por padrão

    // Se uma nova imagem foi selecionada, fazer upload
    if (imagemNova) {
      try {
        const imagemNomeUnico = `${Date.now()}_${sanitizeFileName(nome)}.jpg`;
        
        // Ler arquivo local em base64 e converter para ArrayBuffer
        const base64 = await FileSystem.readAsStringAsync(imagemNova, { encoding: 'base64' });
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
        Alert.alert('Erro no Upload', 'Não foi possível fazer o upload da nova imagem. Mensagem: ' + error.message);
        setLoading(false);
        return;
      }
    }

    const ferramentaAtualizada = {
      nome,
      patrimonio,
      detalhes,
      local,
      categoria_id: categoriaSelecionada.id,
      categoria_nome: categoriaSelecionada.nome,
      imagem_url: imagemUrlSupabase,
    };

    try {
      const { error } = await supabase
        .from('ferramentas')
        .update(ferramentaAtualizada)
        .eq('id', ferramentaInicial.id);

      if (error) throw error;

      Alert.alert('Sucesso!', 'Ferramenta atualizada com sucesso.', [
        { 
          text: 'OK', 
          onPress: () => {
            // Atualizar a ferramenta na navegação
            navigation.navigate('DetalheFerramenta', { 
              ferramenta: { ...ferramentaInicial, ...ferramentaAtualizada } 
            });
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Erro ao Salvar', 'Não foi possível atualizar a ferramenta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleVoltar} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Editar Ferramenta</Text>
          </View>

          <TouchableOpacity style={styles.imagePicker} onPress={() => setImagemModalVisivel(true)}>
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={40} color={theme.primary} />
                <Text style={[styles.imagePickerText, { color: theme.primary }]}>Adicionar Foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <InputField icon="hammer-outline" placeholder="Nome da Ferramenta" value={nome} onChangeText={setNome} />
          <InputField icon="document-text-outline" placeholder="Nº de Patrimônio" value={patrimonio} onChangeText={setPatrimonio} keyboardType="numeric" />

          <TouchableOpacity style={styles.inputContainer} onPress={() => setCategoriaModalVisivel(true)}>
            <Ionicons name="layers-outline" size={22} color={theme.primary} style={styles.inputIcon} />
            <Text style={[styles.input, categoriaSelecionada ? { color: theme.text } : { color: '#A0AEC0' }]}>
              {categoriaSelecionada ? categoriaSelecionada.nome : 'Selecionar Categoria'}
            </Text>
            <Ionicons name="chevron-down" size={22} color={theme.primary} />
          </TouchableOpacity>

          <InputField icon="information-circle-outline" placeholder="Detalhes (opcional)" value={detalhes} onChangeText={setDetalhes} multiline numberOfLines={3} />
          <InputField icon="location-outline" placeholder="Local de Armazenamento" value={local} onChangeText={setLocal} />

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Salvar Alterações</Text>
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
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Selecione a Categoria</Text>
            <FlatList
              data={categoriasLista}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => { setCategoriaSelecionada(item); setCategoriaModalVisivel(false); }}
                >
                  <Ionicons name={item.icone} size={24} color={theme.primary} style={{ marginRight: 15 }} />
                  <Text style={[styles.modalItemText, { color: theme.text }]}>{item.nome}</Text>
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
          <View style={[styles.modalContent, styles.imageModalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Adicionar Foto</Text>
            <TouchableOpacity style={styles.imageOptionButton} onPress={tirarFoto}>
              <Ionicons name="camera-outline" size={24} color={theme.primary} />
              <Text style={[styles.imageOptionText, { color: theme.text }]}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageOptionButton} onPress={escolherDaGaleria}>
              <Ionicons name="image-outline" size={24} color={theme.primary} />
              <Text style={[styles.imageOptionText, { color: theme.text }]}>Escolher da Galeria</Text>
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
  }
});

