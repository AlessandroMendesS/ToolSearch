
import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TelaInicial from './screens/TelaInicial';
import TelaBoasVindas from './screens/TelaBoasVindas';
import TelaCadastro from './screens/TelaCadastro';
import TelaLogin from './screens/TelaLogin';
import Tabs from './Navigation';
import TelaTemas from './screens/TelaTemas';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AdicionarFerramenta from './screens/AdicionarFerramenta';
import AdicionarFerramentaSemPatrimonio from './screens/AdicionarFerramentaSemPatrimonio';
import SelecionarTipoFerramenta from './screens/SelecionarTipoFerramenta';
import DetalheFerramenta from './screens/DetalheFerramenta';
import EditarFerramenta from './screens/EditarFerramenta';
import MeusQRCodes from './screens/MeusQRCodes';
import Dashboard from './screens/Dashboard';
import MeusEmprestimos from './screens/MeusEmprestimos';
import Tutorial from './screens/Tutorial';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Inicial">
            <Stack.Screen name="Inicial" component={TelaInicial} />
            <Stack.Screen name="BoasVindas" component={TelaBoasVindas} />
            <Stack.Screen name="Cadastro" component={TelaCadastro} />
            <Stack.Screen name="Login" component={TelaLogin} />
            <Stack.Screen name="Temas" component={TelaTemas} />
            <Stack.Screen name="SelecionarTipoFerramenta" component={SelecionarTipoFerramenta} />
            <Stack.Screen name="AdicionarFerramenta" component={AdicionarFerramenta} />
            <Stack.Screen name="AdicionarFerramentaSemPatrimonio" component={AdicionarFerramentaSemPatrimonio} />
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="DetalheFerramenta" component={DetalheFerramenta} />
            <Stack.Screen name="EditarFerramenta" component={EditarFerramenta} />
            <Stack.Screen name="MeusQRCodes" component={MeusQRCodes} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="MeusEmprestimos" component={MeusEmprestimos} />
            <Stack.Screen name="Tutorial" component={Tutorial} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}
