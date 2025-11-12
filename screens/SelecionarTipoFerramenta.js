import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function SelecionarTipoFerramenta() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleComPatrimonio = () => {
    navigation.navigate('AdicionarFerramenta');
  };

  const handleSemPatrimonio = () => {
    navigation.navigate('AdicionarFerramentaSemPatrimonio');
  };

  const handleVoltar = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
        <Ionicons name="arrow-back" size={28} color={theme.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Título */}
        <View style={styles.titleContainer}>
          <Ionicons name="construct-outline" size={48} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Adicionar Ferramenta</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Selecione o tipo de cadastro
          </Text>
        </View>

        {/* Opções */}
        <View style={styles.optionsContainer}>
          {/* Opção 1: Com Patrimônio */}
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.card }]}
            onPress={handleComPatrimonio}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="barcode-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Com Nº de Patrimônio</Text>
            <Text style={[styles.optionDescription, { color: theme.text }]}>
              Cadastre ferramentas com número de patrimônio identificado
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={24} color={theme.primary} />
            </View>
          </TouchableOpacity>

          {/* Opção 2: Sem Patrimônio */}
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.card }]}
            onPress={handleSemPatrimonio}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#38A169' + '20' }]}>
              <Ionicons name="add-circle-outline" size={40} color="#38A169" />
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Sem Nº de Patrimônio</Text>
            <Text style={[styles.optionDescription, { color: theme.text }]}>
              Cadastre ferramentas sem número de patrimônio
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={24} color="#38A169" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  arrowContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
  },
});

