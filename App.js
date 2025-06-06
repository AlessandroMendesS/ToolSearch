
import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TelaInicial from './screens/TelaInicial';
import TelaBoasVindas from './screens/TelaBoasVindas';
import TelaCadastro from './screens/TelaCadastro';
import TelaLogin from './screens/TelaLogin';
import Tabs from './Navigation'; // Já estava assim, referenciando a exportação padrão de Navigation.js
import TelaTemas from './screens/TelaTemas';
import TelaLinguagens from './screens/TelaLinguagens';
import { AuthProvider } from './context/AuthContext';
import AdicionarFerramenta from './screens/AdicionarFerramenta';
import DetalheFerramenta from './screens/DetalheFerramenta';
// TelaScannerEmprestimo não é mais importada aqui pois foi removida do Stack

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Inicial">
          <Stack.Screen name="Inicial" component={TelaInicial} />
          <Stack.Screen name="BoasVindas" component={TelaBoasVindas} />
          <Stack.Screen name="Cadastro" component={TelaCadastro} />
          <Stack.Screen name="Login" component={TelaLogin} />
          <Stack.Screen name="Temas" component={TelaTemas} />
          <Stack.Screen name="Linguagens" component={TelaLinguagens} />
          <Stack.Screen name="AdicionarFerramenta" component={AdicionarFerramenta} />
          <Stack.Screen name="Tabs" component={Tabs} />
          {/* <Stack.Screen name="TelaScannerEmprestimo" component={TelaScannerEmprestimo} /> // Removido */}
          <Stack.Screen name="DetalheFerramenta" component={DetalheFerramenta} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
