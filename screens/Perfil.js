import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  BackHandler,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Import useTheme
import { estilos } from "./Perfil.styles";

export default function TelaPerfil({ navigation }) {
  const { user, logout, updateUser, updateUserImage } = useAuth();
  const { theme } = useTheme(); // Use theme
  const [modalVisivel, setModalVisivel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableEmail, setEditableEmail] = useState(user?.email || "");
  const [emailModalVisivel, setEmailModalVisivel] = useState(false); // Novo estado

  const [dadosFormulario, setDadosFormulario] = useState({
    nome: user?.nome || "",
    data_nascimento: user?.data_nascimento || "",
    codigo_funcionario: user?.codigo_funcionario || "",
    cargo: user?.cargo || "",
  });

  useEffect(() => {
    if (user) {
      setDadosFormulario({
        nome: user.nome || "",
        data_nascimento: user.data_nascimento || "",
        codigo_funcionario: user.codigo_funcionario || "",
        cargo: user.cargo || "",
      });
    }
  }, [user]);

  const handleEmailSave = () => {
    // Aqui você pode adicionar qualquer validação necessária para o e-mail
    // Por enquanto, apenas fechar o modal.
    setEmailModalVisivel(false);
  };

  const handleEmailCancel = () => {
    // Resetar o email editável para o valor atual se o usuário cancelar
    setEditableEmail(user?.email || "");
    setEmailModalVisivel(false);
  };

  const escolherImagem = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!resultado.canceled) {
      const newImageUrl = resultado.assets[0].uri;
      updateUserImage(newImageUrl);
    }
  };

  const handleChange = (campo, valor) => {
    setDadosFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const handleSaveChanges = async () => {
    // As informações são agora salvas estaticamente no estado local
    // Não há necessidade de chamar uma API de backend para esta funcionalidade.
    Alert.alert("Sucesso", "Seus dados foram atualizados localmente.");
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      // iOS não permite sair programaticamente; como fallback, poderíamos navegar para a tela inicial do app
      // navigation.reset({ index: 0, routes: [{ name: 'Inicial' }] });
    }
  };

  const renderInfoLinha = (icone, placeholder, valor, campo) => (
    <View style={estilos.infoRow}>
      <Ionicons name={icone} size={24} color={theme.text} style={estilos.infoIcon} />
      <TextInput
        style={[estilos.infoInput, { color: theme.text, borderBottomColor: theme.border }, isEditing && { borderBottomColor: theme.primary }]}
        value={valor}
        onChangeText={(text) => handleChange(campo, text)}
        placeholder={placeholder}
        placeholderTextColor={theme.text}
        editable={isEditing}
      />
    </View>
  );

  const renderBotao = (icone, texto, onPress) => (
    <TouchableOpacity style={estilos.button} onPress={onPress}>
      <Ionicons name={icone} size={24} color={theme.text} style={estilos.buttonIcon} />
      <Text style={[estilos.buttonText, { color: theme.text }]}>{texto}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[estilos.container, { backgroundColor: theme.background, flex: 1 }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[estilos.header, { backgroundColor: theme.primary }]}>
          <TouchableOpacity onPress={escolherImagem} style={[estilos.profileImageContainer, { borderColor: theme.background }]}>
            <Image
              source={user?.imagemPerfil ? { uri: user.imagemPerfil } : require("../assets/img/perfil.png")}
              style={estilos.profileImage}
            />
          </TouchableOpacity>
          <Text style={[estilos.userName, { color: theme.buttonText || '#fff' }]}>{
            typeof user?.nome === "string" ? user.nome : "Nome do Usuário"
          }</Text>
        </View>
        <View style={[estilos.card, { backgroundColor: theme.card }]}>
          <Text style={[estilos.cardTitle, { color: theme.text }]}>Informações Pessoais</Text>
          {renderInfoLinha("person-outline", "Nome", dadosFormulario.nome, "nome")}
          {renderInfoLinha("calendar-outline", "Nascimento", dadosFormulario.data_nascimento, "data_nascimento")}
          {renderInfoLinha("barcode-outline", "Código", dadosFormulario.codigo_funcionario, "codigo_funcionario")}
          {renderInfoLinha("briefcase-outline", "Cargo", dadosFormulario.cargo, "cargo")}
          {isEditing ? (
            <TouchableOpacity style={[estilos.saveButton, { backgroundColor: theme.primary }]} onPress={handleSaveChanges}>
              <Text style={[estilos.saveButtonText, { color: theme.buttonText }]}>Salvar Alterações</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[estilos.editProfileButton, { backgroundColor: theme.primary }]} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color={theme.buttonText} />
              <Text style={[estilos.editProfileButtonText, { color: theme.buttonText }]}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={[estilos.card, { backgroundColor: theme.card }]}>
          <Text style={[estilos.cardTitle, { color: theme.text }]}>Configurações</Text>
          {renderBotao("briefcase-outline", "Meus Empréstimos", () => navigation.navigate("MeusEmprestimos"))}
          {renderBotao("color-palette-outline", "Temas", () => navigation.navigate("Temas"))}
          {renderBotao("qr-code-outline", "Meus QR Codes", () => navigation.navigate("MeusQRCodes"))}
        </View>
        <View style={[estilos.card, { backgroundColor: theme.card }]}>
          {renderBotao("log-out-outline", "Sair", handleLogout)}
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisivel}
          onRequestClose={() => setModalVisivel(false)}
        >
          <View style={estilos.modalOverlay}>
            <View style={[estilos.modalContent, { backgroundColor: theme.card }]}>
              <TouchableOpacity onPress={() => setModalVisivel(false)} style={estilos.closeButton}>
                <Ionicons name="close-circle" size={30} color={theme.error} />
              </TouchableOpacity>
              <Text style={[estilos.modalTitle, { color: theme.text }]}>Alterar Senha</Text>
              {/* Adicionar campos para alterar senha aqui */}
            </View>
          </View>
        </Modal>
        {/* Modal para Edição de E-mail */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={emailModalVisivel}
          onRequestClose={handleEmailCancel}
        >
          <View style={estilos.modalOverlay}>
            <View style={[estilos.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[estilos.modalTitle, { color: theme.text }]}>Editar E-mail</Text>
              <TextInput
                style={[estilos.textInput, { color: theme.text, borderBottomColor: theme.border }]} // Estilo para o input do modal
                value={editableEmail}
                onChangeText={setEditableEmail}
                placeholder="Novo E-mail"
                placeholderTextColor={theme.text}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={estilos.modalButtonContainer}> {/* Container para os botões de ação */}
                <TouchableOpacity style={[estilos.modalButton, { backgroundColor: theme.primary }]} onPress={handleEmailSave}>
                  <Text style={[estilos.modalButtonText, { color: theme.buttonText }]}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[estilos.modalButton, { backgroundColor: theme.secondary }]} onPress={handleEmailCancel}>
                  <Text style={[estilos.modalButtonText, { color: theme.buttonText }]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
