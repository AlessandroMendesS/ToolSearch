import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { emprestimoService } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../context/ThemeContext';

export default function DetalheFerramenta({ route, navigation }) {
  const { ferramenta: ferramentaInicial } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();

  const [ferramenta, setFerramenta] = useState(ferramentaInicial);
  const [emprestada, setEmprestada] = useState(!ferramentaInicial.disponivel);
  const [emprestimoId, setEmprestimoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [podeDevolver, setPodeDevolver] = useState(false);
  const [emprestimoInfo, setEmprestimoInfo] = useState(null);
  const [erroDevolver, setErroDevolver] = useState('');

  // Buscar empréstimo aberto ou último empréstimo para histórico
  const fetchEmprestimoAberto = async () => {
    try {
      const res = await emprestimoService.buscarEmprestimoAberto(ferramentaInicial.id);
      if (res && res.success) {
        if (res.emprestimo) {
          setEmprestada(res.emprestimo.status === 'emprestado');
          setEmprestimoId(res.emprestimo.id);
          setPodeDevolver(res.emprestimo.usuario_id === user.id && res.emprestimo.status === 'emprestado');
          setEmprestimoInfo(res.emprestimo);
        } else {
          setEmprestada(false);
          setEmprestimoId(null);
          setPodeDevolver(false);
          setEmprestimoInfo(null);
        }
      } else {
        setEmprestada(false);
        setEmprestimoId(null);
        setPodeDevolver(false);
        setEmprestimoInfo(null);
      }
    } catch (err) {
      setEmprestada(false);
      setEmprestimoId(null);
      setPodeDevolver(false);
      setEmprestimoInfo(null);
    }
  };

  useEffect(() => {
    setFerramenta(ferramentaInicial);
    fetchEmprestimoAberto();
  }, [ferramentaInicial, user.id]);

  const handleEmprestar = async () => {
    setLoading(true);
    setErroDevolver('');
    try {
      await emprestimoService.registrarEmprestimo({
        ferramenta_id: ferramenta.id,
        usuario_id: user.id,
        local_emprestimo: ferramenta.local || ''
      });
      alert('Ferramenta emprestada com sucesso!');
      await fetchEmprestimoAberto();
    } catch (err) {
      alert('Erro ao emprestar ferramenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevolver = async () => {
    setLoading(true);
    setErroDevolver('');
    try {
      await emprestimoService.registrarDevolucao(emprestimoId, { local_devolucao: ferramenta.local || '' });
      alert('Ferramenta devolvida com sucesso!');
      await fetchEmprestimoAberto();
    } catch (err) {
      let msg = 'Erro ao devolver ferramenta.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErroDevolver(msg);
    } finally {
      setLoading(false);
    }
  };

  // Renderização
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.imageContainer}>
          {ferramenta.imagem_url ? (
            <Image
              source={{ uri: ferramenta.imagem_url }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.card }]}>
              <Ionicons name="construct-outline" size={80} color={theme.primary} />
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{ferramenta.nome}</Text>
        <View style={[styles.infoContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Detalhes</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>{ferramenta.detalhes || 'Não informado'}</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Local</Text>
          <View style={styles.localRow}>
            <Ionicons name="location-outline" size={16} color={theme.text} style={{ marginRight: 5 }} />
            <Text style={[styles.infoText, { color: theme.text }]}>{ferramenta.local || 'Não informado'}</Text>
          </View>
        </View>
        {/* Histórico do último empréstimo */}
        {emprestimoInfo ? (
          <View style={[styles.historicoBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.historicoTitle, { color: theme.primary }]}>Último empréstimo</Text>
            <Text style={[styles.historicoUsuario, { color: theme.text }]}>Usuário: {emprestimoInfo.usuarios?.nome || '#' + emprestimoInfo.usuario_id}</Text>
            <Text style={[styles.historicoData, { color: theme.text }]}>Data: {emprestimoInfo.data_emprestimo ? new Date(emprestimoInfo.data_emprestimo).toLocaleString('pt-BR') : '-'}</Text>
            {emprestimoInfo.status === 'devolvido' && (
              <Text style={[styles.historicoStatus, { color: '#4BB543' }]}>&#9679; Devolvida</Text>
            )}
            {emprestimoInfo.status === 'emprestado' && (
              <Text style={[styles.historicoStatus, { color: '#FFA726' }]}>&#9679; Em uso</Text>
            )}
          </View>
        ) : null}
        {/* Mensagem de erro do botão devolver */}
        {erroDevolver ? (
          <View style={styles.erroBox}><Text style={styles.erroText}>{erroDevolver}</Text></View>
        ) : null}
        {/* Botão de Emprestar/Devolver */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          {emprestada && podeDevolver ? (
            <TouchableOpacity style={[styles.botao, { backgroundColor: '#38A169' }]} onPress={handleDevolver} disabled={loading}>
              <Text style={styles.textoBotao}>{loading ? 'Devolvendo...' : 'Devolver'}</Text>
            </TouchableOpacity>
          ) : !emprestada ? (
            <TouchableOpacity style={[styles.botao, { backgroundColor: '#236D4D' }]} onPress={handleEmprestar} disabled={loading}>
              <Text style={styles.textoBotao}>{loading ? 'Emprestando...' : 'Emprestar'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  scrollContentContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  image: {
    width: 180,
    height: 180,
  },
  imagePlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#EAF7EF',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#334155',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
  },
  infoText: {
    color: '#475569',
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  botao: {
    width: 180,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historicoBox: {
    width: '90%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historicoTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
  },
  historicoUsuario: {
    fontSize: 15,
    marginBottom: 2,
  },
  historicoData: {
    fontSize: 14,
    opacity: 0.7
  },
  historicoStatus: {
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 8,
  },
  erroBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 12,
    alignItems: 'center',
    alignSelf: 'center'
  },
  erroText: {
    color: '#C53030',
    fontSize: 15
  },
});