import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function TelaInicial({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('BoasVindas');
    }, 3000);
  }, []);

  return (
    <View style={estilos.container}>
      <Image source={require('../assets/img/logo.png')} style={estilos.logo} />
      
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 356,
    height: 284,
    justifyContent: "center",
    alignItems: "center",
  }
});