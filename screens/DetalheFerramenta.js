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

export default function DetalheFerramenta({ route, navigation }) {
  const { ferramenta: ferramentaInicial } = route.params;
  const { user } = useAuth();

  const [ferramenta, setFerramenta] = useState(ferramentaInicial);
  const [emprestada, setEmprestada] = useState(!ferramentaInicial.disponivel);
  const [emprestimoId, setEmprestimoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [podeDevolver, setPodeDevolver] = useState(false);

  // Função para buscar empréstimo aberto
  const fetchEmprestimoAberto = async () => {
    try {
      const res = await emprestimoService.buscarEmprestimoAberto(ferramentaInicial.id);
      if (res && res.success) {
        if (res.emprestimo) {
          setEmprestada(true);
          setEmprestimoId(res.emprestimo.id);
          setPodeDevolver(res.emprestimo.usuario_id === user.id);
        } else {
          setEmprestada(false);
          setEmprestimoId(null);
          setPodeDevolver(false);
        }
      } else {
        setEmprestada(false);
        setEmprestimoId(null);
        setPodeDevolver(false);
      }
    } catch (err) {
      setEmprestada(false);
      setEmprestimoId(null);
      setPodeDevolver(false);
    }
  };

  useEffect(() => {
    setFerramenta(ferramentaInicial);
    fetchEmprestimoAberto();
  }, [ferramentaInicial, user.id]);

  const handleEmprestar = async () => {
    setLoading(true);
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
    try {
      await emprestimoService.registrarDevolucao({
        emprestimo_id: emprestimoId,
        local_devolucao: ferramenta.local || ''
      });
      alert('Ferramenta devolvida com sucesso!');
      await fetchEmprestimoAberto();
    } catch (err) {
      alert('Erro ao devolver ferramenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#5D8A70" />
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
            <View style={styles.imagePlaceholder}>
              <Ionicons name="construct-outline" size={80} color="#B3DBC5" />
            </View>
          )}
        </View>

        <Text style={styles.title}>{ferramenta.nome}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <Text style={styles.infoText}>{ferramenta.detalhes || 'Não informado'}</Text>

          <Text style={styles.sectionTitle}>Local</Text>
          <View style={styles.localRow}>
            <Ionicons name="location-outline" size={16} color="#4A5568" style={{ marginRight: 5 }} />
            <Text style={styles.infoText}>{ferramenta.local || 'Não informado'}</Text>
          </View>
        </View>

        {/* Botão de Emprestar/Devolver */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          {emprestada && podeDevolver ? (
            <TouchableOpacity style={[styles.botao, { backgroundColor: '#E53E3E' }]} onPress={handleDevolver} disabled={loading}>
              <Text style={styles.textoBotao}>{loading ? 'Devolvendo...' : 'Devolver'}</Text>
            </TouchableOpacity>
          ) : !emprestada ? (
            <TouchableOpacity style={[styles.botao, { backgroundColor: '#38A169' }]} onPress={handleEmprestar} disabled={loading}>
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
});
