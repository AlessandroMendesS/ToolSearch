import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function TelaLinguagens({ navigation }) {
  const { theme } = useTheme();
  const [idioma, setIdioma] = useState('pt');

  const handleSelect = (lang) => {
    setIdioma(lang);
  };

  const Bandeira = ({ codigo, emoji }) => (
    <TouchableOpacity onPress={() => handleSelect(codigo)} style={estilos.itemBandeira}>
      <Text style={estilos.textoBandeira}>{emoji}</Text>
      <Switch 
        value={idioma === codigo} 
        onValueChange={() => handleSelect(codigo)} 
        trackColor={{ false: "#767577", true: theme.primary }} // Cor do rastro
        thumbColor={idioma === codigo ? "#f4f3f4" : "#f4f3f4"} // Cor do polegar
      />
    </TouchableOpacity>
  );

  return (
    <View style={[estilos.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <Text style={[estilos.titulo, { color: theme.text }]}>Linguagens</Text>
      <Text style={[estilos.subtitulo, { color: theme.text }]}>Escolha a linguagem do seu dispositivo</Text>

      <View style={estilos.bandeiras}>
        <Bandeira codigo="es" emoji="🇪🇸" />
        <Bandeira codigo="en" emoji="🇺🇸" />
        <Bandeira codigo="pt" emoji="🇧🇷" />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  botaoVoltar: { marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  subtitulo: { fontSize: 14, marginBottom: 30 },
  bandeiras: { gap: 20 },
  itemBandeira: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  textoBandeira: { fontSize: 32 },
});
