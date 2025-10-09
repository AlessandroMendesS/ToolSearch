import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

export default function BoasVindas({ navigation }) {
  const { theme } = useTheme();

  return (
    <View style={[estilos.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      {/* Gradiente radial como fundo */}
      <Svg height="150%" width="150%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="grad"
            cx="50%"
            cy="50%"
            rx="70%"
            ry="70%"
            fx="50%"
            fy="50%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={theme.background} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      {/* Imagem */}
      <Image style={estilos.imagem} source={require("../assets/img/inicio.png")} />

      {/* Textos centralizados */}
      <View style={estilos.areaTexto}>
        <Text style={[estilos.textoBemVindo, { color: theme.text }]}>Bem-Vindo(a) ao</Text>
        <Text style={[estilos.toolsearch, { color: theme.text }]}>ToolSearch!</Text>
      </View>

      {/* Botão de alternância */}
      <View style={[estilos.botaoAlternancia, { borderColor: theme.primary, backgroundColor: theme.card }]}>
        <View style={[estilos.deslizador, { backgroundColor: theme.primary }]} />
        <TouchableOpacity
          style={estilos.opcao}
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={[estilos.textoBotao, { color: theme.text }]}>Registro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.opcao}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[estilos.textoBotao, { color: theme.text }]}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const estilos = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  imagem: {
    width: 280,
    height: 280,
    marginBottom: 200,
  },
  areaTexto: {
    alignItems: 'center',
    top: -45,
  },
  textoBemVindo: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  toolsearch: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  botaoAlternancia: {
    flexDirection: "row",
    width: 200,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    position: "absolute",
    bottom: 60,
  },
  deslizador: {
    position: "absolute",
    width: 100,
    height: "100%",
    borderRadius: 25,
    left: 100,
  },
  opcao: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textoBotao: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

