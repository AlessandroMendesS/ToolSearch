import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function TelaInicial({ navigation }) {
  useEffect(() => {
    // Apenas aguardar e seguir para a próxima tela
    const timer = setTimeout(() => {
      navigation.replace('BoasVindas');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/img/logo.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  }
});