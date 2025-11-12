import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function TelaInicial({ navigation }) {
  const { theme } = useTheme();

  useEffect(() => {
    // Apenas aguardar e seguir para a próxima tela
    const timer = setTimeout(() => {
      navigation.replace('BoasVindas');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  }
});