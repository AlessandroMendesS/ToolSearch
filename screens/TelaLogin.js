import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Alert,
  ActivityIndicator 
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext"; // Use o hook de autenticação

const TelaLogin = () => {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  
  const navigation = useNavigation();
  const { login } = useAuth(); // Use o método login do contexto de autenticação

  const handleLogin = async () => {
    // Limpar erro anterior
    setErro("");
    
    // Validação básica
    if (!nome.trim() || !senha.trim()) {
      setErro("Por favor, preencha todos os campos");
      return;
    }
    
    // Ativar indicador de carregamento
    setLoading(true);
    
    try {
      // Tentativa de login usando o contexto de autenticação
      const resultado = await login({ nome, senha });
      
      // Se o login foi bem-sucedido
      if (resultado.success) {
        // Navegue para a tela principal
        navigation.navigate("Tabs");
      } else {
        setErro(resultado.message || "Usuário ou senha incorretos");
        Alert.alert(
          "Erro de login",
          resultado.message || "Usuário ou senha incorretos"
        );
      }
    } catch (error) {
      // Em caso de erro, mostrar mensagem
      setErro(error.message || "Erro ao fazer login. Tente novamente.");
      Alert.alert(
        "Erro de login",
        error.message || "Erro ao fazer login. Tente novamente."
      );
    } finally {
      // Desativar indicador de carregamento
      setLoading(false);
    }
  };

  return (
    <View style={estilos.container}>
      {/* Botão de voltar */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botaoVoltar}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={estilos.titulo}>Olá novamente!</Text>
      <Text style={estilos.subtitulo}>Bem-vindo de volta, sentimos a sua falta!</Text>

      {/* Mensagem de erro */}
      {erro ? <Text style={estilos.erroMensagem}>{erro}</Text> : null}

      {/* Campo Nome */}
      <View style={estilos.campoEntrada}>
        <FontAwesome name="user-o" size={18} color="#999" />
        <TextInput
          style={estilos.entrada}
          placeholder="Digite seu nome"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="none"
        />
      </View>

      {/* Campo Senha */}
      <View style={estilos.campoEntrada}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" />
        <TextInput
          style={estilos.entrada}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          secureTextEntry={!senhaVisivel}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
          <Ionicons name={senhaVisivel ? "eye" : "eye-off"} size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Botão Entrar */}
      <TouchableOpacity 
        style={estilos.botaoEntrar}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={estilos.textoBotaoEntrar}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Separador */}
      <View style={estilos.separador}>
        <View style={estilos.linha} />
        <Text style={estilos.textoSeparador}>ou entre com o e-mail institucional</Text>
        <View style={estilos.linha} />
      </View>

      {/* Botão Google */}
      <TouchableOpacity style={estilos.botaoGoogle}>
        <Image
          source={require("../assets/img/google.png")}
          style={estilos.iconeGoogle}
        />
        <Text style={estilos.textoBotaoGoogle}>Entrar com Google</Text>
      </TouchableOpacity>

      {/* Link Cadastro */}
      <Text style={estilos.textoCadastro}>
        Ainda não possui uma conta?{" "}
        <Text style={estilos.linkCadastro} onPress={() => navigation.navigate("Cadastro")}>
          Cadastre-se
        </Text>
      </Text>
    </View>
  );
};

export default TelaLogin;

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  botaoVoltar: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#7DA38C",
    padding: 12,
    borderRadius: 50,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: "center",
    color: "#444",
    marginBottom: 25,
  },
  erroMensagem: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
  campoEntrada: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 30,
    marginBottom: 15,
  },
  entrada: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#000",
  },
  botaoEntrar: {
    backgroundColor: "#7DA38C",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotaoEntrar: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  separador: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  textoSeparador: {
    marginHorizontal: 10,
    fontSize: 12,
    color: "#666",
  },
  botaoGoogle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
  },
  iconeGoogle: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  textoBotaoGoogle: {
    fontSize: 14,
    color: "#000",
  },
  textoCadastro: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 14,
    color: "#000",
  },
  linkCadastro: {
    color: "#7DA38C",
    fontWeight: "bold",
  },
});