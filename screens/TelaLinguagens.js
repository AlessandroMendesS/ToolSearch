import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TelaLinguagens({ navigation }) {
  const [selecionado, setSelecionado] = useState("pt");

  const handleSelect = (lang) => {
    setSelecionado(lang);
  };

  const Bandeira = ({ codigo, emoji }) => (
    <TouchableOpacity onPress={() => handleSelect(codigo)} style={estilos.itemBandeira}>
      <Text style={estilos.textoBandeira}>{emoji}</Text>
      <Switch value={selecionado === codigo} onValueChange={() => handleSelect(codigo)} />
    </TouchableOpacity>
  );

  return (
    <View style={estilos.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={estilos.titulo}>Linguagens</Text>
      <Text style={estilos.subtitulo}>Escolha a linguagem do seu dispositivo</Text>

      <View style={estilos.bandeiras}>
        <Bandeira codigo="es" emoji="🇪🇸" />
        <Bandeira codigo="en" emoji="🇺🇸" />
        <Bandeira codigo="pt" emoji="🇧🇷" />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f6f6f6" },
  botaoVoltar: { marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  subtitulo: { fontSize: 14, color: "#555", marginBottom: 30 },
  bandeiras: { gap: 20 },
  itemBandeira: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  textoBandeira: { fontSize: 32 },
});
