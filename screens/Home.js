import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  return (
    <SafeAreaView style={estilos.container}>
      <ScrollView contentContainerStyle={estilos.scrollContainer}>
        <View style={estilos.header}>
          <Text style={estilos.headerTitle}>ToolSearch</Text>
          <Text style={estilos.welcomeText}>Bem-vindo ao seu gerenciador de ferramentas</Text>
        </View>
        
        <View style={estilos.content}>
          <Text style={estilos.sectionTitle}>Minhas Ferramentas</Text>
          
          {/* Conteúdo placeholder - você pode personalizar mais tarde */}
          <View style={estilos.emptyState}>
            <Ionicons name="construct-outline" size={50} color="#7DA38C" />
            <Text style={estilos.emptyStateText}>
              Você ainda não tem ferramentas cadastradas
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#001F07",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: "#555",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#001F07",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
    color: "#777",
  }
});
