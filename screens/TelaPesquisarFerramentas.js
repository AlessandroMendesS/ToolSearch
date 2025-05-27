import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  SafeAreaView, StatusBar, FlatList, ActivityIndicator, Dimensions
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

  useEffect(() => {
    // Carrega todas as ferramentas inicialmente ou quando um grupo é desmarcado e não há busca
    if (!grupoSelecionado && !busca.trim()) {
      buscarTodasFerramentas();
    }
  }, [grupoSelecionado, busca]); // Adicionado busca para resetar se a busca for limpa

  useEffect(() => {
    // Busca ferramentas por categoria se um grupo for selecionado
    if (grupoSelecionado) {
      buscarFerramentasPorCategoria(grupoSelecionado.id);
    }
  }, [grupoSelecionado]);

  const buscarTodasFerramentas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const { data, error } = await supabase.from('ferramentas').select('*');
      if (error) throw error;
      setFerramentas(data || []);
    } catch (e) {
      console.error('Erro ao buscar todas as ferramentas:', e);
      setErro('Falha ao carregar ferramentas.');
      setFerramentas([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarFerramentasPorCategoria = async (categoriaId) => {
    setLoading(true);
    setErro(null);
    try {
      const { data, error } = await supabase
        .from('ferramentas')
        .select('*')
        .eq('categoria_id', categoriaId);
      if (error) throw error;
      setFerramentas(data || []);
      if ((data || []).length === 0) {
        setErro('Nenhuma ferramenta encontrada nesta categoria.');
      }
    } catch (e) {
      console.error('Erro ao buscar ferramentas por categoria:', e);
      setErro('Falha ao carregar ferramentas da categoria.');
      setFerramentas([]);
    } finally {
      setLoading(false);
    }
  };

  const ferramentasFiltradas = busca.trim()
    ? ferramentas.filter(f =>
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (f.detalhes && f.detalhes.toLowerCase().includes(busca.toLowerCase())) ||
      (f.local && f.local.toLowerCase().includes(busca.toLowerCase()))
    )
    : ferramentas; // Se não há busca, ferramentasFiltradas é igual a ferramentas (do grupo ou todas)

  const handleSelecionarGrupo = (grupo) => {
    setBusca(''); // Limpa a busca ao selecionar um grupo
    if (grupoSelecionado && grupoSelecionado.id === grupo.id) {
      setGrupoSelecionado(null); // Desseleciona se clicar no mesmo
    } else {
      setGrupoSelecionado(grupo);
    }
  };

  const limparBuscaEGrupo = () => {
    setBusca('');
    setGrupoSelecionado(null);
    // buscarTodasFerramentas() será chamado pelo useEffect
  };

  const renderCategoriaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoriaCard}
      onPress={() => handleSelecionarGrupo(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.categoriaTexto}>{item.nome}</Text>
      {item.imagem ? (
        <Image source={item.imagem} style={styles.categoriaImagem} resizeMode="contain" />
      ) : (
        <View style={[styles.categoriaImagem, styles.categoriaImagemPlaceholder]}>
          <Ionicons name="image-outline" size={40} color="#a0aec0" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFerramentaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ferramentaCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DetalheFerramenta', { ferramenta: item })}
    >
      {item.imagem_url ? (
        <Image source={{ uri: item.imagem_url }} style={styles.ferramentaImagem} resizeMode="cover" />
      ) : (
        <View style={[styles.ferramentaImagem, styles.ferramentaImagemPlaceholderIcon]}>
          <Ionicons name="construct-outline" size={30} color="#a0aec0" />
        </View>
      )}
      <View style={styles.ferramentaInfoContainer}>
        <Text style={styles.ferramentaNome}>{item.nome}</Text>
        <Text style={styles.ferramentaLocal}>Local: {item.local || 'Não informado'}</Text>
        {/* <Text style={styles.ferramentaPatrimonio}>Patrimônio: {item.patrimonio}</Text> */}
        <View style={styles.ferramentaDisponivelContainer}>
          <Text style={styles.ferramentaDisponivelTexto}>Disponível:</Text>
          <View style={[
            styles.disponivelIndicator,
            { backgroundColor: item.disponivel ? '#48bb78' : '#f56565' }
          ]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const mostrarCategorias = !busca.trim() && !grupoSelecionado;
  const mostrarResultadosBusca = busca.trim();
  const mostrarFerramentasGrupo = !busca.trim() && grupoSelecionado;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e6f4ea" barStyle="dark-content" />
      <Text style={styles.title}>Pesquisar</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={22} color="#4a5568" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar ferramentas..."
          placeholderTextColor="#a0aec0"
          value={busca}
          onChangeText={(text) => {
            setBusca(text);
            if (text.trim() && grupoSelecionado) {
              // Se começar a buscar com grupo selecionado, buscar em todas as ferramentas
              // ou manter a busca apenas dentro do grupo? Por ora, mantém no grupo.
              // Para buscar em todas, chamar buscarTodasFerramentas() aqui se text.length === 1 (início da busca)
            }
          }}
        />
        {busca.trim() !== '' && (
          <TouchableOpacity onPress={() => setBusca('')} style={styles.clearSearchButton}>
            <Ionicons name="close-circle-outline" size={22} color="#718096" />
          </TouchableOpacity>
        )}
      </View>

      {/* Botão Voltar para Categorias */}
      {(mostrarFerramentasGrupo || mostrarResultadosBusca) && (
        <TouchableOpacity
          style={styles.botaoVoltarCategorias}
          onPress={limparBuscaEGrupo}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#2c5282" />
          <Text style={styles.botaoVoltarCategoriasTexto}>
            {grupoSelecionado && !busca.trim() ? `Voltar para Categorias (de ${grupoSelecionado.nome})` : 'Voltar para Categorias'}
          </Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color="#38a169" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}

      {!loading && erro && (
        <View style={styles.centeredMessageContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#e53e3e" />
          <Text style={styles.erroText}>{erro}</Text>
        </View>
      )}

      {!loading && !erro && (
        <>
          {mostrarCategorias && (
            <FlatList
              data={grupos}
              renderItem={renderCategoriaItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContentContainer}
              ListEmptyComponent={
                <View style={styles.centeredMessageContainer}>
                  <Text style={styles.emptyText}>Nenhuma categoria disponível.</Text>
                </View>
              }
            />
          )}
          {(mostrarResultadosBusca || mostrarFerramentasGrupo) && (
            <FlatList
              data={ferramentasFiltradas}
              renderItem={renderFerramentaItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContentContainer}
              ListEmptyComponent={
                <View style={styles.centeredMessageContainer}>
                  <Ionicons name="sad-outline" size={40} color="#718096" />
                  <Text style={styles.emptyText}>
                    {busca.trim() ? 'Nenhuma ferramenta encontrada para sua busca.' : 'Nenhuma ferramenta nesta categoria.'}
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f4ea', // Fundo verde bem claro
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2f855a', // Verde escuro para o título
    textAlign: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 25, // Mais arredondado
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    paddingVertical: 4, // Ajuste para melhor alinhamento vertical
  },
  clearSearchButton: {
    padding: 5,
  },
  botaoVoltarCategorias: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  botaoVoltarCategoriasTexto: {
    marginLeft: 8,
    fontSize: 15,
    color: '#2c5282',
    fontWeight: '500',
  },
  listContentContainer: {
    paddingHorizontal: 10, // Espaço nas laterais da lista
    paddingBottom: 20,
  },
  // Estilos para Categoria Card
  categoriaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Para empurrar imagem para a direita
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 10, // Era 20, reduzido para listContentContainer
    marginVertical: 8,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 4,
  },
  categoriaTexto: {
    fontSize: 20, // Aumentado
    fontWeight: '600',
    color: '#2f855a', // Verde escuro
    flexShrink: 1, // Permite que o texto encolha se necessário
    marginRight: 10, // Espaço para a imagem
  },
  categoriaImagem: {
    width: 90, // Ajustado
    height: 70, // Ajustado
    borderRadius: 8,
  },
  categoriaImagemPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7f3', // Tom de verde claro
  },
  // Estilos para Ferramenta Card
  ferramentaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10, // Era 20, reduzido para listContentContainer
    marginVertical: 7,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  ferramentaImagem: {
    width: 75, // Ajustado
    height: 75, // Ajustado
    borderRadius: 8,
    marginRight: 12,
  },
  ferramentaImagemPlaceholderIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7f3',
  },
  ferramentaInfoContainer: {
    flex: 1,
  },
  ferramentaNome: {
    fontWeight: '600',
    fontSize: 17,
    color: '#333', // Preto suave
    marginBottom: 3,
  },
  ferramentaLocal: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  ferramentaDisponivelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ferramentaDisponivelTexto: {
    fontSize: 14,
    color: '#555', // Cinza escuro
  },
  disponivelIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  // Mensagens centralizadas
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4a5568',
  },
  erroText: {
    marginTop: 12,
    fontSize: 16,
    color: '#c53030',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
});