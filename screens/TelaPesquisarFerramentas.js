import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const grupos = [
  { nome: 'Furadeiras', imagem: require('../assets/img/furadeira.png') },
  { nome: 'Chaves', imagem: require('../assets/img/chaves.png') },
  { nome: 'Alicates', imagem: require('../assets/img/alicates.png') },
];

export default function TelaPesquisarFerramentas({ navigation }) {
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f2faf5" barStyle="dark-content" />

      {/* Título */}
      <Text style={styles.title}>Pesquisar</Text>

      {/* Campo de pesquisa */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar ferramentas"
          placeholderTextColor="#666"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Cards de categorias */}
      <View style={styles.cardsContainer}>
        {grupos.map((grupo) => (
          <TouchableOpacity
            key={grupo.nome}
            style={[styles.card, grupoSelecionado === grupo.nome && { borderColor: '#7DA38C', borderWidth: 2 }]}
            onPress={() => setGrupoSelecionado(grupo.nome)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{grupo.nome}</Text>
              <Image source={grupo.imagem} style={styles.cardImage} resizeMode="contain" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Exemplo visual de resultado (estático) */}
      {grupoSelecionado && (
        <View style={styles.ferramentaCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.ferramentaNome}>Paquímetro</Text>
              <Text style={styles.ferramentaLocal}>Local: Sala XX</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.ferramentaDisponivel}>Disponível:</Text>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#4caf50', marginLeft: 4 }} />
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2faf5',
    paddingTop: 20,
    paddingBottom: 70,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004d00',
    marginBottom: 15,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5ec',
    marginHorizontal: 20,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  cardsContainer: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d00',
  },
  cardImage: {
    width: 70,
    height: 40,
  },
  ferramentaCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 12,
    marginHorizontal: 18,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  ferramentaNome: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  ferramentaLocal: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  ferramentaDisponivel: {
    fontSize: 13,
    color: '#222',
    marginTop: 2,
  },
});