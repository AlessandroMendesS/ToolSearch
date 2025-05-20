import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function TelaInicial({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('BoasVindas');
    }, 3000);
  }, []);

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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 356,
    height: 284,
    resizeMode: 'contain',
  }
});