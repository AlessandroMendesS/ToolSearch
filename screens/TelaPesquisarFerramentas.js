import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  SafeAreaView, StatusBar, FlatList, ActivityIndicator,
  Animated, Easing, Platform, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import supabase from '../api/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { agruparFerramentas, buscarFerramentaDisponivel } from '../utils/toolGrouping';
import { toolService } from '../api/apiService';


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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTools, setSelectedTools] = useState([]);
  
  const animLista = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!grupoSelecionado && !busca.trim()) {
      buscarTodasFerramentas();
    }
  }, [grupoSelecionado, busca]);

  
  useFocusEffect(
    React.useCallback(() => {
      
      setGrupoSelecionado(null);
      setBusca('');
      buscarTodasFerramentas(); 
      return () => {
        
      };
    }, [])
  );

  useEffect(() => {
    if (grupoSelecionado) {
      buscarFerramentasPorCategoria(grupoSelecionado.id);
      
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

  
  const ferramentasFiltradas = busca.trim()
    ? ferramentas.filter(f =>
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (f.detalhes && f.detalhes.toLowerCase().includes(busca.toLowerCase())) ||
      (f.local && f.local.toLowerCase().includes(busca.toLowerCase()))
    )
    : ferramentas;

  
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
    
    Animated.timing(animLista, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) setGrupoSelecionado(null);
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedTools.length === 0) return;

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir ${selectedTools.length} ferramenta(s) selecionada(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              for (const toolId of selectedTools) {
                await toolService.deleteTool(toolId);
              }
              Alert.alert('Sucesso', `${selectedTools.length} ferramenta(s) excluída(s) com sucesso.`);
              setSelectionMode(false);
              setSelectedTools([]);
              buscarTodasFerramentas(); 
            } catch (error) {
              console.error('Erro ao excluir ferramentas:', error);
              Alert.alert('Erro', 'Falha ao excluir ferramenta(s).');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedTools([]);
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
    
    if (item.total !== undefined) {
      const ferramentaDisponivel = buscarFerramentaDisponivel(item);
      const temDisponivel = item.disponivel > 0;
      
      return (
        <TouchableOpacity
          style={[styles.ferramentaCard, { backgroundColor: theme.card }]}
          activeOpacity={0.8}
          onPress={() => {
            
            
            if (ferramentaDisponivel) {
              navigation.navigate('DetalheFerramenta', { 
                ferramenta: ferramentaDisponivel,
                grupo: item 
              });
            } else {
              
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
          <TouchableOpacity onPress={() => navigation.navigate('Perfil')} style={[styles.fotoPerfilContainer, { borderColor: theme.primary }]}>
            <Image
              source={user?.imagemPerfil ? { uri: user.imagemPerfil } : require('../assets/img/perfil.png')}
              style={styles.fotoPerfil}
            />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 }}>
              <Text style={[styles.saudacao, { color: theme.text, flex: 1 }]}>{saudacao} 👋</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity 
                  style={[styles.actionButtonIconOnly, { backgroundColor: theme.primary + '20' }]} 
                  onPress={() => navigation.navigate('MeusEmprestimos')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="briefcase-outline" size={20} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButtonIconOnly, { backgroundColor: theme.primary + '20' }]} 
                  onPress={() => navigation.navigate('Tutorial')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="help-circle-outline" size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>
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
      {selectionMode && (
        <View style={[styles.selectionActionsContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.selectionCount, { color: theme.text }]}>
            {selectedTools.length} selecionado(s)
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.error }]} 
              onPress={handleDeleteSelected}
              disabled={selectedTools.length === 0}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonTextPrimary}>Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.secondary }]} 
              onPress={handleCancelSelection}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonTextPrimary}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    
    backgroundColor: '#e6f4ea', 
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
  actionButtonCircular: {
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  actionButtonTextCircular: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonSmall: {
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtonIconOnly: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    shadowOpacity: 0,
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
    paddingHorizontal: 10, 
    paddingBottom: 100, 
  },
  
  categoriaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 10, 
    marginVertical: 8,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 4,
  },
  categoriaTexto: {
    fontSize: 20, 
    fontWeight: '600',
    color: '#2f855a', 
    flexShrink: 1, 
    marginRight: 10, 
  },
  categoriaImagem: {
    width: 90, 
    height: 70, 
    borderRadius: 8,
  },
  categoriaImagemPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7f3', 
  },
  
  ferramentaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 7,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  cardSelectionMode: {
    paddingLeft: 10, 
  },
  checkboxContainer: {
    marginRight: 10,
  },
  ferramentaImagem: {
    width: 75, 
    height: 75, 
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
    color: '#333', 
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
    color: '#555', 
  },
  disponivelIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  
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
  selectionActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});