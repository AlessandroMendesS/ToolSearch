import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const categorias = [
  { nome: "Elétrico", icone: <MaterialCommunityIcons name="flash" size={28} color="#7DA38C" /> },
  { nome: "Microuts", icone: <FontAwesome5 name="microscope" size={28} color="#7DA38C" /> },
  { nome: "Medidos", icone: <Ionicons name="speedometer-outline" size={28} color="#7DA38C" /> },
];

const HomeScreen = () => {
  const { user } = useAuth();
  const [imagemPerfil, setImagemPerfil] = useState(user?.imagemPerfil || null);

  // Saudação dinâmica
  const hora = new Date().getHours();
  let saudacao = "";
  if (hora < 12) saudacao = "Bom Dia!";
  else if (hora < 18) saudacao = "Boa Tarde!";
  else saudacao = "Boa Noite!";

  return (
    <SafeAreaView style={estilos.container}>
      <View style={estilos.topo}>
        <View style={estilos.row}>
          <Image
            source={imagemPerfil ? { uri: imagemPerfil } : require("../assets/img/perfil.png")}
            style={estilos.fotoPerfil}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={estilos.saudacao}>{saudacao} <Text>👋</Text></Text>
            <Text style={estilos.nomeUsuario}>{user?.nome || "Usuário"}</Text>
          </View>
          <TouchableOpacity style={estilos.qrButton}>
            <Ionicons name="qr-code-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={estilos.scrollContainer}>
        {/* Card Ferramenta Mais Utilizada */}
        <View style={estilos.cardFerramentaMais}>
          <Text style={estilos.tituloCardFerramenta}>Ferramenta Mais Utilizada</Text>
        </View>
        {/* Card Ferramenta Menos Utilizada */}
        <View style={estilos.cardFerramentaMenos}>
          <Text style={estilos.tituloCardFerramenta}>Ferramenta Menos Utilizada</Text>
        </View>

        {/* Categorias */}
        <View style={estilos.categoriasContainer}>
          {categorias.map((cat, idx) => (
            <View key={cat.nome} style={estilos.categoriaItem}>
              {cat.icone}
              <Text style={estilos.categoriaNome}>{cat.nome}</Text>
            </View>
          ))}
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
  topo: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  fotoPerfil: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#7DA38C",
  },
  saudacao: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  nomeUsuario: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#001F07",
  },
  qrButton: {
    backgroundColor: "#7DA38C",
    borderRadius: 20,
    padding: 8,
    marginLeft: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 80,
  },
  cardFerramentaMais: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f4ec",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardFerramentaMenos: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4e6e6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  imgFerramenta: {
    width: 60,
    height: 60,
    marginRight: 16,
    resizeMode: "contain",
  },
  tituloCardFerramenta: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3a5a40",
  },
  categoriasContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  categoriaItem: {
    alignItems: "center",
    flex: 1,
  },
  categoriaNome: {
    marginTop: 6,
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
});
