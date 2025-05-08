import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

export default function BoasVindas({ navigation }) {
  return (
    <View style={estilos.container}>
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
            <Stop offset="0%" stopColor="#ccffcc" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      {/* Imagem */}
      <Image style={estilos.imagem} source={require("../assets/img/inicio.png")} />

      {/* Textos centralizados */}
      <View style={estilos.areaTexto}>
        <Text style={estilos.textoBemVindo}>Bem-Vindo(a) ao</Text>
        <Text style={estilos.toolsearch}>ToolSearch!</Text>
      </View>

      {/* Botão de alternância */}
      <View style={estilos.botaoAlternancia}>
        <View style={estilos.deslizador} />
        <TouchableOpacity 
          style={estilos.opcao}
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={estilos.textoBotao}>Registro</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={estilos.opcao}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={estilos.textoBotao}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: '#fff',
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
    borderColor: "#fff",
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 60, 
  },
  deslizador: {
    position: "absolute",
    width: 100,
    height: "100%",
    backgroundColor: "#FFF",
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
    color: "#000",
  },
});
