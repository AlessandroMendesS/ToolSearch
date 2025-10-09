import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext"; // Use o hook de autenticação
import { useTheme } from "../context/ThemeContext";

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
  const { theme } = useTheme();

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
    <View style={[estilos.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      {/* Botão de voltar */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={[estilos.botaoVoltar, { backgroundColor: theme.primary }]}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={[estilos.titulo, { color: theme.text }]}>Olá!</Text>
      <Text style={[estilos.subtitulo, { color: theme.text }]}>Junte-se a nós para gerenciar suas ferramentas</Text>

      {/* Mensagem de erro */}
      {erro ? <Text style={estilos.erroMensagem}>{erro}</Text> : null}

      {/* Campo Nome */}
      <View style={[estilos.containerInput, { backgroundColor: theme.card }]}>
        <Ionicons name="person-outline" size={18} color={theme.text} />
        <TextInput 
          style={[estilos.input, { color: theme.text }]}
          placeholder="Entre com seu nome" 
          placeholderTextColor={theme.text + '80'}
          value={nome}
          onChangeText={setNome}
          autoCapitalize="none"
        />
      </View>

      {/* Campo Senha */}
      <View style={[estilos.containerInput, { backgroundColor: theme.card }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.text} />
        <TextInput
          style={[estilos.input, { color: theme.text }]}
          placeholder="Entre com sua senha"
          placeholderTextColor={theme.text + '80'}
          secureTextEntry={!senhaVisivel}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
          <Ionicons name={senhaVisivel ? "eye" : "eye-off"} size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Campo Confirmar Senha */}
      <View style={[estilos.containerInput, { backgroundColor: theme.card }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.text} />
        <TextInput
          style={[estilos.input, { color: theme.text }]}
          placeholder="Confirme sua senha"
          placeholderTextColor={theme.text + '80'}
          secureTextEntry={!confirmarSenhaVisivel}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
        <TouchableOpacity onPress={() => setConfirmarSenhaVisivel(!confirmarSenhaVisivel)}>
          <Ionicons name={confirmarSenhaVisivel ? "eye" : "eye-off"} size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Botão Registrar */}
      <TouchableOpacity 
        style={[estilos.botaoRegistrar, { backgroundColor: theme.primary }]}
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
        <View style={[estilos.linha, { backgroundColor: theme.border }]} />
        <Text style={[estilos.textoSeparador, { color: theme.text }]}>ou registrar-se com o e-mail institucional</Text>
        <View style={[estilos.linha, { backgroundColor: theme.border }]} />
      </View>

      {/* Link Entrar */}
      <Text style={[estilos.textoEntrar, { color: theme.text }]}>
        Já possui uma conta? <Text onPress={() => navigation.navigate('Login')} style={[estilos.linkEntrar, { color: theme.primary }]}>Entrar</Text>
      </Text>
    </View>
  );
};

export default TelaCadastro;

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  botaoVoltar: {
    position: "absolute",
    top: 40,
    left: 20,
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
    padding: 14,
    borderRadius: 30,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  botaoRegistrar: {
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotaoRegistrar: {
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
  },
  textoSeparador: {
    marginHorizontal: 10,
    fontSize: 12,
  },
  textoEntrar: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 14,
  },
  linkEntrar: {
    fontWeight: "bold",
  },
});