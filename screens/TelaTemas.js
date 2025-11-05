import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function TelaTemas({ navigation }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const renderOpcaoTema = (tema, icone) => (
    <TouchableOpacity
      style={[
        estilos.opcaoTema,
        { borderColor: theme.border },
        (isDarkMode && tema === "escuro") || (!isDarkMode && tema === "claro")
          ? { backgroundColor: theme.primary, borderColor: theme.primary }
          : null,
      ]}
      onPress={toggleTheme}
    >
      <Ionicons
        name={icone}
        size={24}
        color={
          (isDarkMode && tema === "escuro") || (!isDarkMode && tema === "claro")
            ? "#fff"
            : theme.text
        }
      />
      <Text
        style={[
          estilos.textoOpcaoTema,
          { color: theme.text },
          (isDarkMode && tema === "escuro") || (!isDarkMode && tema === "claro")
            ? estilos.textoOpcaoTemaSelecionada
            : null,
        ]}
      >
        {tema.charAt(0).toUpperCase() + tema.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[estilos.container, { backgroundColor: theme.background, flex: 1 }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={[estilos.content, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

      <Text style={[estilos.titulo, { color: theme.text }]}>Temas</Text>
      <Text style={[estilos.subtitulo, { color: theme.text }]}>
        Escolha o tema que mais se adapta ao seu estilo.
      </Text>

      <View style={estilos.containerOpcoes}>
        {renderOpcaoTema("claro", "sunny-outline")}
        {renderOpcaoTema("escuro", "moon-outline")}
      </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? ((StatusBar.currentHeight || 0) + 8) : 0,
  },
  botaoVoltar: {
    marginBottom: 20,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    marginBottom: 30,
  },
  containerOpcoes: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  opcaoTema: {
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    width: "45%",
  },
  textoOpcaoTema: {
    marginTop: 10,
    fontSize: 16,
  },
  textoOpcaoTemaSelecionada: {
    color: "#fff",
    fontWeight: "bold",
  },
});
