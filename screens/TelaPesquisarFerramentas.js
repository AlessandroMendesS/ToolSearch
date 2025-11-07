import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  SafeAreaView, StatusBar, FlatList, ActivityIndicator,
  Animated, Easing, Platform // Adicionar Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import supabase from '../api/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { agruparFerramentas, buscarFerramentaDisponivel } from '../utils/toolGrouping';

// Grupos de ferramentas com todos os que existem no AdicionarFerramenta.js
const grupos = [
  { id: '1', nome: 'Furadeiras', imagem: require('../assets/img/furadeira.png') },
  { id: '2', nome: 'Chaves', imagem: require('../assets/img/chaves.png') },
  { id: '3', nome: 'Alicates', imagem: require('../assets/img/alicates.png') },
  { id: '4', nome: 'Medidores', imagem: require('../assets/img/Medidores.png') },
  { id: '5', nome: 'Serras', imagem: require('../assets/img/serras.png') },
  { id: '6', nome: 'Outros', imagem: require('../assets/img/OUtros.png') },
];

export default function TelaPesquisarFerramentas({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [ferramentas, setFerramentas] = useState([]);
  const [ferramentasAgrupadas, setFerramentasAgrupadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  // Para animação de abertura do grupo
  const animLista = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!grupoSelecionado && !busca.trim()) {
      buscarTodasFerramentas();
    }
  }, [grupoSelecionado, busca]);

  // Atualizar dados quando a tela receber foco (após voltar de outras telas)
  useFocusEffect(
    React.useCallback(() => {
      if (!grupoSelecionado && !busca.trim()) {
        buscarTodasFerramentas();
      } else if (grupoSelecionado) {
        buscarFerramentasPorCategoria(grupoSelecionado.id);
      }
    }, [grupoSelecionado, busca])
  );

  useEffect(() => {
    if (grupoSelecionado) {
      buscarFerramentasPorCategoria(grupoSelecionado.id);
      // Animação suave de entrada da lista
      animLista.setValue(0);
      Animated.timing(animLista, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }).start();
    }
  }, [grupoSelecionado]);

  const buscarTodasFerramentas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const { data, error } = await supabase.from('ferramentas').select('*');
      if (error) throw error;
      const ferramentasData = data || [];
      setFerramentas(ferramentasData);
      // Agrupar ferramentas
      const agrupadas = agruparFerramentas(ferramentasData);
      setFerramentasAgrupadas(agrupadas);
    } catch (e) {
      console.error('Erro ao buscar todas as ferramentas:', e);
      setErro('Falha ao carregar ferramentas.');
      setFerramentas([]);
      setFerramentasAgrupadas([]);
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
      const ferramentasData = data || [];
      setFerramentas(ferramentasData);
      // Agrupar ferramentas
      const agrupadas = agruparFerramentas(ferramentasData);
      setFerramentasAgrupadas(agrupadas);
      if (ferramentasData.length === 0) {
        setErro('Nenhuma ferramenta encontrada nesta categoria.');
      }
    } catch (e) {
      console.error('Erro ao buscar ferramentas por categoria:', e);
      setErro('Falha ao carregar ferramentas da categoria.');
      setFerramentas([]);
      setFerramentasAgrupadas([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ferramentas individuais para busca
  const ferramentasFiltradas = busca.trim()
    ? ferramentas.filter(f =>
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (f.detalhes && f.detalhes.toLowerCase().includes(busca.toLowerCase())) ||
      (f.local && f.local.toLowerCase().includes(busca.toLowerCase()))
    )
    : ferramentas;

  // Filtrar e agrupar ferramentas filtradas
  const gruposFiltrados = busca.trim()
    ? agruparFerramentas(ferramentasFiltradas)
    : ferramentasAgrupadas;

  const handleSelecionarGrupo = (grupo) => {
    setBusca('');
    if (grupoSelecionado && grupoSelecionado.id === grupo.id) {
      setGrupoSelecionado(null);
    } else {
      setGrupoSelecionado(grupo);
    }
  };

  const limparBuscaEGrupo = () => {
    setBusca('');
    // Animação de saída (fade out)
    Animated.timing(animLista, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) setGrupoSelecionado(null);
    });
  };

  const renderCategoriaItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoriaCard, { backgroundColor: theme.card }]}
      onPress={() => handleSelecionarGrupo(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoriaTexto, { color: theme.primary }]}>{item.nome}</Text>
      {item.imagem ? (
        <Image source={item.imagem} style={styles.categoriaImagem} resizeMode="contain" />
      ) : (
        <View style={[styles.categoriaImagem, styles.categoriaImagemPlaceholder]}>
          <Ionicons name="image-outline" size={40} color="#a0aec0" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFerramentaItem = ({ item }) => {
    // Se for um grupo (tem propriedade 'total'), renderizar como grupo
    if (item.total !== undefined) {
      const ferramentaDisponivel = buscarFerramentaDisponivel(item);
      const temDisponivel = item.disponivel > 0;
      
      return (
        <TouchableOpacity
          style={[styles.ferramentaCard, { backgroundColor: theme.card }]}
          activeOpacity={0.8}
          onPress={() => {
            // Se houver ferramenta disponível, navegar para ela
            // Caso contrário, mostrar todas as ferramentas do grupo
            if (ferramentaDisponivel) {
              navigation.navigate('DetalheFerramenta', { 
                ferramenta: ferramentaDisponivel,
                grupo: item 
              });
            } else {
              // Navegar para uma tela de seleção de ferramenta do grupo
              navigation.navigate('DetalheFerramenta', { 
                ferramenta: item.ferramentas[0],
                grupo: item 
              });
            }
          }}
        >
          {item.imagem_url ? (
            <Image source={{ uri: item.imagem_url }} style={styles.ferramentaImagem} resizeMode="cover" />
          ) : (
            <View style={[styles.ferramentaImagem, styles.ferramentaImagemPlaceholderIcon]}>
              <Ionicons name="construct-outline" size={30} color="#a0aec0" />
            </View>
          )}
          <View style={styles.ferramentaInfoContainer}>
            <Text style={[styles.ferramentaNome, { color: theme.text }]}>{item.nome}</Text>
            <Text style={[styles.ferramentaLocal, { color: theme.text }]}>Local: {item.local || 'Não informado'}</Text>
            <View style={styles.ferramentaDisponivelContainer}>
              <Text style={[styles.ferramentaDisponivelTexto, { color: theme.text }]}>
                Disponíveis: {item.disponivel}/{item.total}
              </Text>
              <View style={[
                styles.disponivelIndicator,
                { backgroundColor: temDisponivel ? '#48bb78' : '#f56565' }
              ]} />
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    
    // Renderização para ferramenta individual (fallback)
    return (
    <TouchableOpacity
      style={[styles.ferramentaCard, { backgroundColor: theme.card }]}
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
        <Text style={[styles.ferramentaNome, { color: theme.text }]}>{item.nome}</Text>
        <Text style={[styles.ferramentaLocal, { color: theme.text }]}>Local: {item.local || 'Não informado'}</Text>
        <View style={styles.ferramentaDisponivelContainer}>
          <Text style={[styles.ferramentaDisponivelTexto, { color: theme.text }]}>Disponível:</Text>
          <View style={[
            styles.disponivelIndicator,
            { backgroundColor: item.disponivel ? '#48bb78' : '#f56565' }
          ]} />
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  const mostrarCategorias = !busca.trim() && !grupoSelecionado;
  const mostrarResultadosBusca = busca.trim();
  const mostrarFerramentasGrupo = !busca.trim() && grupoSelecionado;

  const hora = new Date().getHours();
  let saudacao = '';
  if (hora < 12) saudacao = 'Bom Dia!';
  else if (hora < 18) saudacao = 'Boa Tarde!';
  else saudacao = 'Boa Noite!';

  const ListHeader = () => (
    <View>
      <View style={[styles.topo, { backgroundColor: theme.background }]}>
        <View style={styles.row}>
          <View style={[styles.fotoPerfilContainer, { borderColor: theme.primary }]}>
            <Image
              source={user?.imagemPerfil ? { uri: user.imagemPerfil } : require('../assets/img/perfil.png')}
              style={styles.fotoPerfil}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.saudacao, { color: theme.text }]}>{saudacao} 👋</Text>
            <Text style={[styles.nomeUsuario, { color: theme.text }]} numberOfLines={1}>{user?.nome || 'Usuário'}</Text>
          </View>
        </View>
      </View>
      {(mostrarFerramentasGrupo || mostrarResultadosBusca) && (
        <TouchableOpacity
          style={styles.botaoVoltarCategorias}
          onPress={limparBuscaEGrupo}
        >
          <Ionicons name="arrow-back-outline" size={20} color={theme.primary} />
          <Text style={[styles.botaoVoltarCategoriasTexto, { color: theme.primary }]}>
            {grupoSelecionado && !busca.trim() ? `Voltar para Categorias (de ${grupoSelecionado.nome})` : 'Voltar para Categorias'}
          </Text>
        </TouchableOpacity>
      )}
      {loading && (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Carregando...</Text>
        </View>
      )}
      {!loading && erro && (
        <View style={styles.centeredMessageContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#e53e3e" />
          <Text style={[styles.erroText, { color: theme.text }]}>{erro}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background, flex: 1 }]}>
      <StatusBar backgroundColor={theme.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <ListHeader />
      {loading && (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Carregando...</Text>
        </View>
      )}
      {!loading && mostrarCategorias && (
        <FlatList
          data={grupos}
          renderItem={renderCategoriaItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            <View style={styles.centeredMessageContainer}>
              <Text style={[styles.emptyText, { color: theme.text }]}>Nenhuma categoria disponível.</Text>
            </View>
          }
        />
      )}
      {!loading && (mostrarResultadosBusca || mostrarFerramentasGrupo) && (
        <FlatList
          data={gruposFiltrados}
          renderItem={renderFerramentaItem}
          keyExtractor={(item) => item.id || item.id?.toString() || `grupo_${item.nome}_${item.categoria_id}`}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            <View style={styles.centeredMessageContainer}>
              <Ionicons name="sad-outline" size={40} color={theme.text} />
              <Text style={[styles.emptyText, { color: theme.text }]}>Nenhuma ferramenta nesta categoria.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1, // Remover o flex:1 daqui pois já estará na SafeAreaView
    backgroundColor: '#e6f4ea', // Fundo verde bem claro
  },
  topo: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? ((StatusBar.currentHeight || 0) + 8) : 20,
    paddingBottom: 12,
    backgroundColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fotoPerfilContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoPerfil: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  saudacao: {
    fontSize: 15,
    color: '#4A5568',
    fontWeight: '500',
  },
  nomeUsuario: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 1,
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
    paddingBottom: 100, // Aumentado para não cortar itens no Android
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