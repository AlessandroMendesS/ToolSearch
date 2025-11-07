import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import supabase from '../api/supabaseClient';
import { emprestimoService } from '../api/apiService';
import { formatarPatrimonio } from '../utils/toolGrouping';

export default function MeusEmprestimos({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [devolvendo, setDevolvendo] = useState(null);

  const carregarEmprestimos = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Buscar empréstimos ativos do usuário
      const { data: emprestimosData, error: errEmprestimos } = await supabase
        .from('emprestimos')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('status', 'emprestado')
        .order('data_emprestimo', { ascending: false });

      if (errEmprestimos) {
        console.error('Erro ao buscar empréstimos:', errEmprestimos);
        setEmprestimos([]);
        setLoading(false);
        return;
      }

      // Buscar informações das ferramentas
      if (emprestimosData && emprestimosData.length > 0) {
        const ferramentaIds = emprestimosData.map(e => e.ferramenta_id);
        const { data: ferramentasData, error: errFerramentas } = await supabase
          .from('ferramentas')
          .select('*')
          .in('id', ferramentaIds);

        if (!errFerramentas && ferramentasData) {
          // Combinar empréstimos com ferramentas
          const emprestimosCompletos = emprestimosData.map(emprestimo => {
            const ferramenta = ferramentasData.find(f => f.id === emprestimo.ferramenta_id);
            return {
              ...emprestimo,
              ferramenta: ferramenta || null
            };
          });
          setEmprestimos(emprestimosCompletos);
        } else {
          setEmprestimos([]);
        }
      } else {
        setEmprestimos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
      setEmprestimos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarEmprestimos();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      carregarEmprestimos();
    }, [user])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    carregarEmprestimos();
  }, []);

  const calcularTempoEmprestimo = (dataEmprestimo) => {
    if (!dataEmprestimo) return 'Data não disponível';
    
    const agora = new Date();
    const emprestimo = new Date(dataEmprestimo);
    const diffMs = agora - emprestimo;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);
    
    if (diffDias > 0) {
      return `${diffDias} dia${diffDias > 1 ? 's' : ''}`;
    } else if (diffHoras > 0) {
      return `${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    } else {
      const diffMinutos = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
    }
  };

  const handleDevolver = async (emprestimo) => {
    Alert.alert(
      'Devolver Ferramenta',
      `Deseja devolver "${emprestimo.ferramenta?.nome || 'Ferramenta'}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Devolver',
          style: 'default',
          onPress: async () => {
            try {
              setDevolvendo(emprestimo.id);
              await emprestimoService.registrarDevolucao(emprestimo.id, {
                local_devolucao: emprestimo.ferramenta?.local || ''
              });
              
              Alert.alert('Sucesso', 'Ferramenta devolvida com sucesso!');
              carregarEmprestimos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível devolver a ferramenta.');
              console.error('Erro ao devolver:', error);
            } finally {
              setDevolvendo(null);
            }
          }
        }
      ]
    );
  };

  const renderEmprestimo = ({ item }) => {
    if (!item.ferramenta) return null;

    const tempoEmprestimo = calcularTempoEmprestimo(item.data_emprestimo);
    const dataFormatada = item.data_emprestimo
      ? new Date(item.data_emprestimo).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Data não disponível';

    return (
      <TouchableOpacity
        style={[styles.emprestimoCard, { backgroundColor: theme.card }]}
        onPress={() => {
          navigation.navigate('DetalheFerramenta', { ferramenta: item.ferramenta });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.emprestimoContent}>
          <Image
            source={{ uri: item.ferramenta.imagem_url || 'https://via.placeholder.com/100' }}
            style={styles.ferramentaImagem}
          />
          <View style={styles.emprestimoInfo}>
            <Text style={[styles.ferramentaNome, { color: theme.text }]} numberOfLines={1}>
              {item.ferramenta.nome}
            </Text>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color={theme.text} style={{ opacity: 0.6 }} />
              <Text style={[styles.infoText, { color: theme.text }]}>
                {tempoEmprestimo}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color={theme.text} style={{ opacity: 0.6 }} />
              <Text style={[styles.infoText, { color: theme.text }]}>
                {dataFormatada}
              </Text>
            </View>
            {item.ferramenta.local && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color={theme.text} style={{ opacity: 0.6 }} />
                <Text style={[styles.infoText, { color: theme.text }]} numberOfLines={1}>
                  {item.ferramenta.local}
                </Text>
              </View>
            )}
            {item.ferramenta.patrimonio && (
              <View style={styles.infoRow}>
                <Ionicons name="barcode-outline" size={14} color={theme.text} style={{ opacity: 0.6 }} />
                <Text style={[styles.infoText, { color: theme.text }]}>
                  {formatarPatrimonio(item.ferramenta.patrimonio)}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.devolverButton,
              { backgroundColor: devolvendo === item.id ? theme.primary + '80' : '#38A169' }
            ]}
            onPress={() => handleDevolver(item)}
            disabled={devolvendo === item.id}
          >
            {devolvendo === item.id ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="return-down-back" size={18} color="#FFF" />
                <Text style={styles.devolverTexto}>Devolver</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Meus Empréstimos</Text>
          {emprestimos.length > 0 && (
            <Text style={[styles.headerSubtitle, { color: theme.text }]}>
              {emprestimos.length} ferramenta{emprestimos.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Conteúdo */}
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Carregando...</Text>
        </View>
      ) : emprestimos.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="checkmark-circle-outline" size={80} color={theme.text + '40'} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhum empréstimo ativo</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            Você não possui ferramentas emprestadas no momento
          </Text>
          <TouchableOpacity
            style={[styles.explorarButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Tabs', { screen: 'Início' })}
          >
            <Text style={styles.explorarTexto}>Explorar Ferramentas</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={emprestimos}
          renderItem={renderEmprestimo}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? ((StatusBar.currentHeight || 0) + 8) : 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 24,
  },
  explorarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  explorarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emprestimoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  emprestimoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ferramentaImagem: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  emprestimoInfo: {
    flex: 1,
  },
  ferramentaNome: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.7,
  },
  devolverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    marginLeft: 12,
  },
  devolverTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

