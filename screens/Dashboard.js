import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import supabase from '../api/supabaseClient';
import { apiClient } from '../api/apiService';

const { width: screenWidth } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalFerramentas: 0,
    ferramentasDisponiveis: 0,
    ferramentasEmUso: 0,
    totalEmprestimos: 0,
    emprestimosHoje: 0,
    tempoMedioEmprestimo: 0,
    categoriaMaisUsada: null,
    topUsuarios: [],
    tendencias: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas de ferramentas
      const { data: ferramentas, error: errFerramentas } = await supabase
        .from('ferramentas')
        .select('id, disponivel, categoria_id, data_criacao');

      // Buscar estatísticas de empréstimos (sem join para evitar erro de foreign key)
      const { data: emprestimos, error: errEmprestimos } = await supabase
        .from('emprestimos')
        .select('*')
        .order('data_emprestimo', { ascending: false })
        .limit(200);

      if (errFerramentas) {
        console.error('Erro ao buscar ferramentas:', errFerramentas);
        // Se houver erro, usar dados vazios
        setStats({
          totalFerramentas: 0,
          ferramentasDisponiveis: 0,
          ferramentasEmUso: 0,
          totalEmprestimos: 0,
          emprestimosHoje: 0,
          tempoMedioEmprestimo: 0,
          categoriaMaisUsada: null,
          topUsuarios: [],
          tendencias: []
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (errEmprestimos) {
        console.error('Erro ao buscar empréstimos:', errEmprestimos);
        // Continuar mesmo com erro em empréstimos, usar array vazio
      }

      // Buscar usuários separadamente
      const { data: usuarios, error: errUsuarios } = await supabase
        .from('usuarios')
        .select('id, nome');

      // Criar mapa de usuários para lookup rápido
      const usuariosMap = {};
      if (usuarios && !errUsuarios) {
        usuarios.forEach(u => {
          usuariosMap[u.id] = u.nome;
        });
      }

      // Buscar ferramentas para mapear categoria_id
      const { data: todasFerramentas, error: errTodasFerramentas } = await supabase
        .from('ferramentas')
        .select('id, categoria_id');

      const ferramentasMap = {};
      if (todasFerramentas && !errTodasFerramentas) {
        todasFerramentas.forEach(f => {
          ferramentasMap[f.id] = f.categoria_id;
        });
      }

      const totalFerramentas = ferramentas?.length || 0;
      const ferramentasDisponiveis = ferramentas?.filter(f => f.disponivel).length || 0;
      const ferramentasEmUso = totalFerramentas - ferramentasDisponiveis;
      const totalEmprestimos = emprestimos?.length || 0;

      // Empréstimos hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const emprestimosHoje = emprestimos?.filter(e => {
        if (!e.data_emprestimo) return false;
        const dataEmp = new Date(e.data_emprestimo);
        return dataEmp >= hoje;
      }).length || 0;

      // Calcular tempo médio de empréstimo
      const emprestimosCompletos = emprestimos?.filter(e => e.data_devolucao && e.data_emprestimo) || [];
      let tempoTotal = 0;
      emprestimosCompletos.forEach(e => {
        try {
          const inicio = new Date(e.data_emprestimo);
          const fim = new Date(e.data_devolucao);
          const diffHours = (fim - inicio) / (1000 * 60 * 60); // horas
          if (diffHours > 0) {
            tempoTotal += diffHours;
          }
        } catch (err) {
          console.log('Erro ao calcular tempo:', err);
        }
      });
      const tempoMedioEmprestimo = emprestimosCompletos.length > 0 
        ? Math.round(tempoTotal / emprestimosCompletos.length) 
        : 0;

      // Categoria mais usada
      const categoriasCount = {};
      emprestimos?.forEach(e => {
        if (e.ferramenta_id && ferramentasMap[e.ferramenta_id]) {
          const catId = ferramentasMap[e.ferramenta_id];
          categoriasCount[catId] = (categoriasCount[catId] || 0) + 1;
        }
      });
      const categoriaMaisUsadaId = Object.keys(categoriasCount).length > 0
        ? Object.keys(categoriasCount).reduce((a, b) => 
            categoriasCount[a] > categoriasCount[b] ? a : b
          )
        : null;

      // Top usuários
      const usuariosCount = {};
      emprestimos?.forEach(e => {
        if (e.usuario_id) {
          const userId = e.usuario_id;
          const userName = usuariosMap[userId] || `Usuário ${userId}`;
          if (!usuariosCount[userId]) {
            usuariosCount[userId] = {
              nome: userName,
              count: 0
            };
          }
          usuariosCount[userId].count += 1;
        }
      });
      const topUsuarios = Object.values(usuariosCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Análise de tendências (últimos 7 dias)
      const ultimos7Dias = [];
      for (let i = 6; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        data.setHours(0, 0, 0, 0);
        const proximoDia = new Date(data);
        proximoDia.setDate(proximoDia.getDate() + 1);
        
        const count = emprestimos?.filter(e => {
          if (!e.data_emprestimo) return false;
          try {
            const dataEmp = new Date(e.data_emprestimo);
            return dataEmp >= data && dataEmp < proximoDia;
          } catch {
            return false;
          }
        }).length || 0;

        ultimos7Dias.push({
          dia: data.toLocaleDateString('pt-BR', { weekday: 'short' }).split(',')[0],
          count
        });
      }

      setStats({
        totalFerramentas,
        ferramentasDisponiveis,
        ferramentasEmUso,
        totalEmprestimos,
        emprestimosHoje,
        tempoMedioEmprestimo,
        categoriaMaisUsada: categoriaMaisUsadaId,
        topUsuarios,
        tendencias: ultimos7Dias
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { backgroundColor: theme.card }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.text, opacity: 0.7 }]}>{label}</Text>
    </TouchableOpacity>
  );

  const maxTendencia = stats.tendencias.length > 0 
    ? Math.max(...stats.tendencias.map(t => t.count), 1)
    : 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Carregando insights...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
        >
          {/* Cards de Estatísticas Principais */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="construct"
              label="Total"
              value={stats.totalFerramentas}
              color="#38A169"
            />
            <StatCard
              icon="checkmark-circle"
              label="Disponíveis"
              value={stats.ferramentasDisponiveis}
              color="#48BB78"
            />
            <StatCard
              icon="time"
              label="Em Uso"
              value={stats.ferramentasEmUso}
              color="#ED8936"
            />
            <StatCard
              icon="swap-horizontal"
              label="Empréstimos"
              value={stats.totalEmprestimos}
              color="#4299E1"
            />
          </View>

          {/* Gráfico de Tendências */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color={theme.primary} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Tendências (7 dias)</Text>
            </View>
            <View style={styles.chartContainer}>
              {stats.tendencias.map((item, index) => (
                <View key={index} style={styles.chartBarContainer}>
                  <View style={styles.chartBarWrapper}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${(item.count / maxTendencia) * 100}%`,
                          backgroundColor: theme.primary,
                          minHeight: item.count > 0 ? 8 : 0
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.chartLabel, { color: theme.text }]}>{item.dia}</Text>
                  <Text style={[styles.chartValue, { color: theme.primary }]}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Insights Inteligentes */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={24} color="#F6AD55" />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Insights Inteligentes</Text>
            </View>
            
            <View style={styles.insightItem}>
              <Ionicons name="calendar" size={20} color="#48BB78" />
              <View style={styles.insightContent}>
                <Text style={[styles.insightText, { color: theme.text }]}>
                  {stats.emprestimosHoje > 0 
                    ? `${stats.emprestimosHoje} empréstimo(s) realizado(s) hoje!`
                    : 'Nenhum empréstimo hoje. Mantenha a organização!'}
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <Ionicons name="time-outline" size={20} color="#4299E1" />
              <View style={styles.insightContent}>
                <Text style={[styles.insightText, { color: theme.text }]}>
                  Tempo médio de empréstimo: {stats.tempoMedioEmprestimo}h
                </Text>
              </View>
            </View>

            {stats.ferramentasEmUso > 0 && (
              <View style={[styles.insightItem, styles.insightWarning]}>
                <Ionicons name="warning" size={20} color="#ED8936" />
                <View style={styles.insightContent}>
                  <Text style={[styles.insightText, { color: theme.text }]}>
                    {stats.ferramentasEmUso} ferramenta(s) estão em uso no momento
                  </Text>
                </View>
              </View>
            )}

            {stats.ferramentasDisponiveis === 0 && stats.totalFerramentas > 0 && (
              <View style={[styles.insightItem, styles.insightAlert]}>
                <Ionicons name="alert-circle" size={20} color="#F56565" />
                <View style={styles.insightContent}>
                  <Text style={[styles.insightText, { color: theme.text }]}>
                    Todas as ferramentas estão em uso!
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Top Usuários */}
          {stats.topUsuarios.length > 0 && (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="trophy" size={24} color="#F6AD55" />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Top Usuários</Text>
              </View>
              {stats.topUsuarios.map((usuario, index) => (
                <View key={index} style={styles.userRankItem}>
                  <View style={[styles.rankBadge, { backgroundColor: index === 0 ? '#F6AD55' : theme.primary + '40' }]}>
                    <Text style={[styles.rankNumber, { color: index === 0 ? '#FFF' : theme.primary }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]}>{usuario.nome}</Text>
                    <Text style={[styles.userStats, { color: theme.text, opacity: 0.6 }]}>
                      {usuario.count} empréstimo(s)
                    </Text>
                  </View>
                  <MaterialCommunityIcons 
                    name={index === 0 ? 'trophy' : 'medal'} 
                    size={24} 
                    color={index === 0 ? '#F6AD55' : theme.primary} 
                  />
                </View>
              ))}
            </View>
          )}

          {/* Recomendações */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="sparkles" size={24} color="#9333EA" />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Recomendações</Text>
            </View>
            
            {stats.totalFerramentas === 0 && (
              <View style={styles.recommendationItem}>
                <Ionicons name="add-circle" size={20} color="#9333EA" />
                <Text style={[styles.recommendationText, { color: theme.text }]}>
                  Comece adicionando ferramentas ao seu inventário!
                </Text>
              </View>
            )}

            {stats.ferramentasEmUso > stats.ferramentasDisponiveis && (
              <View style={styles.recommendationItem}>
                <Ionicons name="checkmark-done-circle" size={20} color="#9333EA" />
                <Text style={[styles.recommendationText, { color: theme.text }]}>
                  Considere adicionar mais ferramentas desta categoria devido à alta demanda
                </Text>
              </View>
            )}

            {stats.tempoMedioEmprestimo > 24 && (
              <View style={styles.recommendationItem}>
                <Ionicons name="time" size={20} color="#9333EA" />
                <Text style={[styles.recommendationText, { color: theme.text }]}>
                  O tempo médio de empréstimo está alto. Revise os processos de devolução.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                // Voltar para Tabs e navegar para a aba Buscar
                navigation.navigate('Tabs', {
                  screen: 'Buscar'
                });
              }}
            >
              <Text style={[styles.actionButtonText, { color: '#FFF' }]}>
                Explorar Ferramentas
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? ((StatusBar.currentHeight || 0) + 8) : 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100, // Aumentado para não cortar o bloco de recomendações
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (screenWidth - 45) / 2,
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    paddingVertical: 10,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBarWrapper: {
    width: '80%',
    height: 100,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },
  chartValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  insightWarning: {
    backgroundColor: '#FEF3E2',
  },
  insightAlert: {
    backgroundColor: '#FEE2E2',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userRankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userStats: {
    fontSize: 13,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
    paddingVertical: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});
