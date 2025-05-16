import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Modal, FlatList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const grupos = [
  { id: '1', nome: 'Furadeiras', imagem: require('../assets/img/furadeira.png') },
  { id: '2', nome: 'Chaves', imagem: require('../assets/img/chaves.png') },
  { id: '3', nome: 'Alicates', imagem: require('../assets/img/alicates.png') },
];

export default function AdicionarFerramenta() {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [nome, setNome] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [local, setLocal] = useState('');

  // Função para lidar com a submissão do formulário
  const handleSubmit = () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome da ferramenta');
      return;
    }

    // Aqui você implementaria a lógica para salvar a ferramenta
    Alert.alert(
      'Sucesso',
      'Ferramenta adicionada com sucesso!',
      [{ text: 'OK', onPress: () => resetForm() }]
    );
  };

  // Função para resetar o formulário
  const resetForm = () => {
    setNome('');
    setDetalhes('');
    setLocal('');
    setImagem(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Adicionar Nova Ferramenta</Text>
      
      {/* Upload imagem */}
      <TouchableOpacity style={styles.uploadArea}>
        <Ionicons name="cloud-upload-outline" size={48} color="#a0c8b0" />
        <Text style={styles.uploadText}>Envie uma imagem</Text>
      </TouchableOpacity>

      {/* Formulário */}
      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput 
        style={[styles.input, styles.inputMultiline]} 
        placeholder="Detalhes" 
        value={detalhes} 
        onChangeText={setDetalhes}
        multiline
      />
      <TextInput style={styles.input} placeholder="Local" value={local} onChangeText={setLocal} />

      {/* Botão Submit */}
      <TouchableOpacity style={styles.botaoSubmit} onPress={handleSubmit}>
        <Text style={styles.botaoSubmitText}>Adicionar Ferramenta</Text>
      </TouchableOpacity>

      {/* Botão '+' flutuante */}
      <TouchableOpacity style={styles.botaoAdicionar} onPress={() => setModalVisivel(true)}>
        <Ionicons name="add" size={32} color="#2e7d32" />
      </TouchableOpacity>

      {/* Modal de grupos */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisivel(false)} style={styles.modalClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Adicione essa ferramenta a algum grupo:</Text>

            <FlatList
              data={grupos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.grupoItem}>
                  <Image source={item.imagem} style={styles.grupoImagem} />
                  <Text style={styles.grupoTexto}>{item.nome}</Text>
                  <TouchableOpacity>
                    <Ionicons name="add-circle" size={24} color="#2e7d32" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2e7d32',
    textAlign: 'center',
  },
  uploadArea: { 
    alignItems: 'center', 
    marginBottom: 30,
    backgroundColor: '#f0f7f0',
    padding: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a0c8b0',
    borderStyle: 'dashed',
  },
  uploadText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: '#888' 
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    fontSize: 16,
    paddingVertical: 8,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  botaoAdicionar: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#a0c8b0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  botaoSubmit: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoSubmitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    paddingTop: 30,
  },
  modalClose: {
    position: 'absolute',
    top: -30,
    left: -30,
    backgroundColor: '#2e7d32',
    borderRadius: 20,
    padding: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grupoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  grupoImagem: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  grupoTexto: {
    flex: 1,
    fontSize: 16,
  },
});