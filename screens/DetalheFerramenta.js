import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DetalheFerramenta({ route, navigation }) {
  const { ferramenta } = route.params;
  const [quantidade, setQuantidade] = useState(1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Topo com botão voltar e três pontinhos */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#7DA38C" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={28} color="#7DA38C" />
        </TouchableOpacity>
      </View>
      {/* Imagem centralizada */}
      <View style={styles.imageContainer}>
        {ferramenta.imagem_url ? (
          <Image
            source={{ uri: ferramenta.imagem_url }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="construct-outline" size={80} color="#B3DBC5" />
        )}
      </View>
      {/* Contador */}
      <View style={styles.counterContainer}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setQuantidade(Math.max(1, quantidade - 1))}
        >
          <Ionicons name="remove" size={26} color="#7DA38C" />
        </TouchableOpacity>
        <Text style={styles.counterText}>{quantidade}</Text>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setQuantidade(quantidade + 1)}
        >
          <Ionicons name="add" size={26} color="#7DA38C" />
        </TouchableOpacity>
      </View>
      {/* Título */}
      <Text style={styles.title}>{ferramenta.nome}</Text>
      {/* Detalhes */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Detalhes</Text>
        <Text style={styles.infoText}>{ferramenta.detalhes || '-'}</Text>
        <Text style={styles.sectionTitle}>Local</Text>
        <View style={styles.localRow}>
          <Ionicons name="location-outline" size={16} color="#333" style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>{ferramenta.local || '-'}</Text>
        </View>
      </View>
      {/* Botão Emprestar */}
      <TouchableOpacity style={styles.emprestarButton}>
        <Text style={styles.emprestarButtonText}>Emprestar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    paddingTop: 24,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  imageContainer: {
    backgroundColor: '#EAF7EF',
    borderRadius: 100,
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  image: {
    width: 70,
    height: 70,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  counterButton: {
    padding: 6,
  },
  counterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
    color: '#222',
    marginTop: 6,
    marginBottom: 16,
  },
  infoContainer: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
    marginBottom: 2,
    marginTop: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  emprestarButton: {
    backgroundColor: '#7DA38C',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 8,
  },
  emprestarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
