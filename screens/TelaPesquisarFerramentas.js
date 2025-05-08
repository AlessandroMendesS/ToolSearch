import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TelaPesquisarFerramentas({ navigation }) {
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
        />
      </View>
      
      {/* Cards de categorias */}
      <View style={styles.cardsContainer}>
        {/* Card Furadeiras */}
        <TouchableOpacity style={styles.card} onPress={() => {}}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Furadeiras</Text>
            <Image 
              source={require('../assets/img/furadeira.png')} 
              style={styles.cardImage} 
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        
        {/* Card Chaves */}
        <TouchableOpacity style={styles.card} onPress={() => {}}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Chaves</Text>
            <Image 
              source={require('../assets/img/chaves.png')} 
              style={styles.cardImage} 
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        
        {/* Card Alicates */}
        <TouchableOpacity style={styles.card} onPress={() => {}}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Alicates</Text>
            <Image 
              source={require('../assets/img/alicates.png')} 
              style={styles.cardImage} 
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
      
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
  cardsContainer: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d00',
  },
  cardImage: {
    width: 70,
    height: 40,
  },
});