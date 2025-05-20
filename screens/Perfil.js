import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function TelaPerfil({ navigation }) {
  const [imagemPerfil, setImagemPerfil] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const { user } = useAuth();

  const [dadosFormulario, setDadosFormulario] = useState({
    nome: user?.nome || "",
    nascimento: "",
    codigo: "",
    cargo: "",
  });

  const [modoEdicao, setModoEdicao] = useState({
    nome: false,
    nascimento: false,
    codigo: false,
    cargo: false,
  });

  const escolherImagem = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagemPerfil(resultado.assets[0].uri);
    }
  };

  const alternarEdicao = (campo) => {
    setModoEdicao((anterior) => ({
      ...anterior,
      [campo]: !anterior[campo],
    }));
  };

  const handleChange = (campo, valor) => {
    setDadosFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  return (
    <SafeAreaView style={estilos.container}>
      <View style={estilos.fundoCabecalho} />

      <TouchableOpacity onPress={escolherImagem} style={estilos.wrapperImagemPerfil}>
        <Image
          source={
            imagemPerfil
              ? { uri: imagemPerfil }
              : require("../assets/img/perfil.png")
          }
          style={estilos.imagemPerfil}
        />
      </TouchableOpacity>

      <View style={estilos.cartao}>
        <TouchableOpacity style={estilos.linha} onPress={() => setModalVisivel(true)}>
          <Text style={estilos.icone}>👤</Text>
          <Text style={estilos.texto}>Conta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.linha}>
          <Text style={estilos.icone}>🔒</Text>
          <Text style={estilos.texto}>Senhas</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.cartao}>
        <TouchableOpacity onPress={() => navigation.navigate("Temas")} style={estilos.linha}>
          <Text style={estilos.icone}>🎨</Text>
          <Text style={estilos.texto}>Temas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Linguagens")} style={estilos.linha}>
          <Text style={estilos.icone}>🌐</Text>
          <Text style={estilos.texto}>Linguagem</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.linha}>
          <Text style={estilos.icone}>⬅️</Text>
          <Text style={estilos.texto}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Modal flutuante */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={estilos.overlayModal}>
          <View style={estilos.cardModal}>
            <TouchableOpacity
              onPress={() => setModalVisivel(false)}
              style={estilos.fecharVerde}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={estilos.saudacao}>Olá {user?.nome}</Text>

            {[
              { key: "nome", label: "Nome", placeholder: "Digite seu nome completo" },
              { key: "nascimento", label: "Data de nascimento", placeholder: "DD/MM/AAAA" },
              { key: "codigo", label: "Código de funcionário", placeholder: "Digite seu código" },
              { key: "cargo", label: "Cargo", placeholder: "Digite seu cargo" },
            ].map((item) => (
              <View key={item.key} style={estilos.campo}>
                <Text style={estilos.label}>{item.label}</Text>
                <View style={estilos.linhaInput}>
                  <TextInput
                    style={[
                      estilos.input,
                      modoEdicao[item.key] ? estilos.inputAtivo : {},
                    ]}
                    value={dadosFormulario[item.key]}
                    onChangeText={(texto) => handleChange(item.key, texto)}
                    editable={modoEdicao[item.key]}
                    placeholder={item.placeholder}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity onPress={() => alternarEdicao(item.key)}>
                    <Ionicons
                      name={modoEdicao[item.key] ? "checkmark-outline" : "create-outline"}
                      size={20}
                      color="#72B096"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6", alignItems: "center" },
  fundoCabecalho: {
    backgroundColor: "#72B096",
    height: 140,
    width: "100%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  wrapperImagemPerfil: {
    marginTop: -50,
    borderRadius: 100,
    padding: 4,
    backgroundColor: "#fff",
  },
  imagemPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cartao: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 16,
    marginTop: 20,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  icone: { fontSize: 18, marginRight: 16 },
  texto: { fontSize: 16, color: "#333" },

  // Modal
  overlayModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardModal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    paddingTop: 40,
    position: "relative",
  },
  fecharVerde: {
    position: "absolute",
    top: -15,
    left: -15,
    backgroundColor: "#72B096",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  saudacao: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
  },
  campo: { marginBottom: 16 },
  label: { fontSize: 12, color: "#999" },
  linhaInput: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  inputAtivo: {
    borderBottomColor: "#72B096",
    fontWeight: "bold",
  },
  cardModal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    paddingTop: 30,
    position: "relative",
    alignItems: "center",
  },
  saudacao: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  campo: {
    marginBottom: 16,
    width: "100%",
  },
});
