import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TelaInicial from './screens/TelaInicial';
import TelaBoasVindas from './screens/TelaBoasVindas';
import TelaCadastro from './screens/TelaCadastro';
import TelaLogin from './screens/TelaLogin';
import Tabs from './Navigation'; // Aqui está o nosso componente com as Bottom Tabs
import TelaTemas from './screens/TelaTemas';
import TelaLinguagens from './screens/TelaLinguagens';
import { AuthProvider } from './context/AuthContext'; // Adicionando a importação do AuthProvider

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
            {/* Quando o usuário logar, ele é redirecionado para as tabs */}
            <Stack.Screen name="Tabs" component={Tabs} />
          </Stack.Navigator>
        </NavigationContainer>
    </AuthProvider>
  );
}