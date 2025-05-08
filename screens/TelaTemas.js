import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TelaTemas({ navigation }) {
  const [modoEscuro, setModoEscuro] = useState(false);

  return (
    <View style={estilos.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={estilos.titulo}>Temas</Text>
      <Text style={estilos.subtitulo}>Escolha o tema que mais se adapta com seu estilo</Text>

      <View style={estilos.linhaSwitch}>
        <Text style={estilos.rotulo}>Escuro</Text>
        <Switch value={modoEscuro} onValueChange={setModoEscuro} />
      </View>

      <View style={estilos.grelha}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={estilos.circuloTema}>
            <Text style={estilos.textoTema}>Inverno</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f6f6f6" },
  botaoVoltar: { marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  subtitulo: { fontSize: 14, color: "#555", marginBottom: 20 },
  linhaSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  rotulo: { fontSize: 16 },
  grelha: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  circuloTema: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#D8E7FF",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  textoTema: { fontSize: 12, marginTop: 8, color: "#555" },
});
