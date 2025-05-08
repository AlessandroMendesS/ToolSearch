import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext"; // Use o hook de autenticação

const TelaCadastro = () => {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  
  const navigation = useNavigation();
  const { register } = useAuth(); // Use o método register do contexto de autenticação

  const handleCadastro = async () => {
    // Limpar erro anterior
    setErro("");
    
    // Validação básica
    if (!nome.trim() || !senha.trim() || !confirmarSenha.trim()) {
      setErro("Por favor, preencha todos os campos");
      return;
    }
    
    // Validar se as senhas coincidem
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }
    
    // Ativar indicador de carregamento
    setLoading(true);
    
    try {
      // Tentativa de cadastro usando o contexto de autenticação
      const userData = {
        nome: nome.trim(),
        senha: senha.trim(),
        confirmarSenha: confirmarSenha.trim()
      };
      
      console.log("Tentando cadastrar usuário:", nome);
      const resultado = await register(userData);
      
      // Se o cadastro foi bem-sucedido
      if (resultado.success) {
        Alert.alert(
          "Sucesso",
          "Cadastro realizado com sucesso!",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate("Tabs") 
            }
          ]
        );
      } else {
        setErro(resultado.message || "Erro ao cadastrar. Tente novamente.");
        Alert.alert(
          "Erro de cadastro",
          resultado.message || "Erro ao cadastrar. Tente novamente."
        );
      }
    } catch (error) {
      // Em caso de erro, mostrar mensagem
      setErro(error.message || "Erro ao cadastrar. Tente novamente.");
      Alert.alert(
        "Erro de cadastro",
        error.message || "Erro ao cadastrar. Tente novamente."
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
      <Text style={estilos.titulo}>Olá!</Text>
      <Text style={estilos.subtitulo}>Junte-se a nós para gerenciar suas ferramentas</Text>

      {/* Mensagem de erro */}
      {erro ? <Text style={estilos.erroMensagem}>{erro}</Text> : null}

      {/* Campo Nome */}
      <View style={estilos.containerInput}>
        <FontAwesome name="user-o" size={18} color="#999" />
        <TextInput 
          style={estilos.input} 
          placeholder="Entre com seu nome" 
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="none"
        />
      </View>

      {/* Campo Senha */}
      <View style={estilos.containerInput}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" />
        <TextInput
          style={estilos.input}
          placeholder="Entre com sua senha"
          placeholderTextColor="#999"
          secureTextEntry={!senhaVisivel}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
          <Ionicons name={senhaVisivel ? "eye" : "eye-off"} size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Campo Confirmar Senha */}
      <View style={estilos.containerInput}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" />
        <TextInput
          style={estilos.input}
          placeholder="Confirme sua senha"
          placeholderTextColor="#999"
          secureTextEntry={!confirmarSenhaVisivel}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
        <TouchableOpacity onPress={() => setConfirmarSenhaVisivel(!confirmarSenhaVisivel)}>
          <Ionicons name={confirmarSenhaVisivel ? "eye" : "eye-off"} size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Botão Registrar */}
      <TouchableOpacity 
        style={estilos.botaoRegistrar}
        onPress={handleCadastro}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={estilos.textoBotaoRegistrar}>Registrar-se</Text>
        )}
      </TouchableOpacity>

      {/* Separador */}
      <View style={estilos.containerSeparador}>
        <View style={estilos.linha} />
        <Text style={estilos.textoSeparador}>ou registrar-se com o e-mail institucional</Text>
        <View style={estilos.linha} />
      </View>

      {/* Botão Google */}
      <TouchableOpacity style={estilos.botaoGoogle}>
        <Image
          source={require("../assets/img/google.png")}
          style={estilos.iconeGoogle}
        />
        <Text style={estilos.textoBotaoGoogle}>Google</Text>
      </TouchableOpacity>

      {/* Link Entrar */}
      <Text style={estilos.textoEntrar}>
        Já possui uma conta? <Text onPress={() => navigation.navigate('Login')} style={estilos.linkEntrar}>Entrar</Text>
      </Text>
    </View>
  );
};

export default TelaCadastro;

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
    fontSize: 28,
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
  containerInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 30,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#000",
  },
  botaoRegistrar: {
    backgroundColor: "#7DA38C",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotaoRegistrar: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  containerSeparador: {
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
  textoEntrar: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 14,
    color: "#000",
  },
  linkEntrar: {
    color: "#7DA38C",
    fontWeight: "bold",
  },
});