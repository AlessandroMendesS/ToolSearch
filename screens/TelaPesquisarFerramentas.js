import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  SafeAreaView, StatusBar, FlatList, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../api/supabaseClient';

// Grupos de ferramentas com todos os que existem no AdicionarFerramenta.js
const grupos = [
  { id: '1', nome: 'Furadeiras', imagem: require('../assets/img/furadeira.png') },
  { id: '2', nome: 'Chaves', imagem: require('../assets/img/chaves.png') },
  { id: '3', nome: 'Alicates', imagem: require('../assets/img/alicates.png') },
  { id: '4', nome: 'Medidores', imagem: null },
  { id: '5', nome: 'Serras', imagem: null },
  { id: '6', nome: 'Outros', imagem: null },
];

export default function TelaPesquisarFerramentas({ navigation }) {
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [ferramentas, setFerramentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Buscar todas as ferramentas quando o componente monta
  useEffect(() => {
    buscarTodasFerramentas();
  }, []);

  // Efeito para filtrar quando o grupo é selecionado
  useEffect(() => {
    if (grupoSelecionado) {
      buscarFerramentasPorCategoria(grupoSelecionado.id);
    }
  }, [grupoSelecionado]);

  // Função para buscar todas as ferramentas do Supabase
  const buscarTodasFerramentas = async () => {
    try {
      setLoading(true);
      setErro(null);

      const { data, error } = await supabase
        .from('ferramentas')
        .select('*');

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        setErro('Erro ao buscar ferramentas');
      } else {
        console.log('Ferramentas carregadas:', data?.length || 0);
        setFerramentas(data || []);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setErro('Erro ao buscar ferramentas');
      setFerramentas([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar ferramentas por categoria do Supabase
  const buscarFerramentasPorCategoria = async (categoriaId) => {
    try {
      setLoading(true);
      setErro(null);

      const { data, error } = await supabase
        .from('ferramentas')
        .select('*')
        .eq('categoria_id', categoriaId);

      if (error) {
        console.error('Erro ao buscar ferramentas por categoria:', error);
        setErro('Erro ao buscar ferramentas');
      } else {
        setFerramentas(data || []);

        if ((data || []).length === 0) {
          setErro(`Nenhuma ferramenta nesta categoria`);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar ferramentas:', error);
      setErro('Erro ao buscar ferramentas');
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar ferramentas pela busca
  const ferramentasFiltradas = busca.trim()
    ? ferramentas.filter(f =>
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (f.detalhes && f.detalhes.toLowerCase().includes(busca.toLowerCase())) ||
      (f.local && f.local.toLowerCase().includes(busca.toLowerCase()))
    )
    : ferramentas;

  // Função para selecionar um grupo
  const selecionarGrupo = (grupo) => {
    if (grupoSelecionado && grupoSelecionado.id === grupo.id) {
      setGrupoSelecionado(null);
      buscarTodasFerramentas();
    } else {
      setGrupoSelecionado(grupo);
    }
  };

  // Renderizar item da lista de ferramentas
  const renderFerramentaItem = ({ item }) => (
    <View style={styles.ferramentaCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.imagem_url ? (
          <Image
            source={{ uri: item.imagem_url }}
            style={{ width: 60, height: 60, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: '#f0f7f0',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Ionicons name="construct-outline" size={30} color="#a0c8b0" />
          </View>
        )}
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.ferramentaNome}>{item.nome}</Text>
          <Text style={styles.ferramentaLocal}>Local: {item.local}</Text>
          <Text style={styles.ferramentaPatrimonio}>Patrimônio: {item.patrimonio}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.ferramentaDisponivel}>Disponível:</Text>
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: item.disponivel ? '#4caf50' : '#f44336',
              marginLeft: 4
            }} />
          </View>
        </View>
      </View>
    </View>
  );

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
      <FlatList
        data={grupos}
        keyExtractor={(item) => item.id}
        horizontal={true}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.categoriaCard,
              grupoSelecionado?.id === item.id && styles.categoriaCardSelecionado
            ]}
            onPress={() => selecionarGrupo(item)}
          >
            <View style={styles.categoriaImagemContainer}>
              {item.imagem ? (
                <Image source={item.imagem} style={styles.categoriaImagem} resizeMode="contain" />
              ) : (
                <Ionicons name="tools-outline" size={24} color="#2e7d32" />
              )}
            </View>
            <Text style={styles.categoriaTexto}>{item.nome}</Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 20 }}
      />

      {/* Lista de ferramentas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Carregando ferramentas...</Text>
        </View>
      ) : erro && ferramentasFiltradas.length === 0 ? (
        <View style={styles.erroContainer}>
          <Ionicons name="alert-circle" size={40} color="#f44336" />
          <Text style={styles.erroText}>{erro}</Text>
        </View>
      ) : ferramentasFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="information-circle" size={40} color="#666" />
          <Text style={styles.emptyText}>
            Nenhuma ferramenta encontrada.
          </Text>
        </View>
      ) : (
        <FlatList
          data={ferramentasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFerramentaItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
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
  categoriaCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 6,
    padding: 12,
    width: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoriaCardSelecionado: {
    borderColor: '#7DA38C',
    borderWidth: 2,
    backgroundColor: '#f0f7f0',
  },
  categoriaImagemContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoriaImagem: {
    width: 30,
    height: 30,
  },
  categoriaTexto: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
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
  ferramentaPatrimonio: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  ferramentaDisponivel: {
    fontSize: 13,
    color: '#222',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  erroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  erroText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});