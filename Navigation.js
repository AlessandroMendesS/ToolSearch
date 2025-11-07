import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TelaInicial from './screens/Home';
import TelaPerfil from './screens/Perfil';
import TelaLeituraCodigoBarras from './screens/TelaLeituraCodigoBarras';
import TelaPesquisarFerramentas from './screens/TelaPesquisarFerramentas';
import LerQRCodes from './screens/LerQRCodes';
import TelaTemas from './screens/TelaTemas';
import { useTheme } from './context/ThemeContext';
import Dashboard from './screens/Dashboard';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Tabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: { ...estilos.bottomBar, backgroundColor: theme.card },
      }}
    >
      <Tab.Screen
        name="Início"
        component={TelaPesquisarFerramentas}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={focused ? theme.primary : theme.text} />
          ),
          unmountOnBlur: true
        }}
      />
      <Tab.Screen
        name="Home"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "analytics" : "analytics-outline"} size={26} color={focused ? theme.primary : theme.text} />
          ),
        }}
      />
      <Tab.Screen
        name="Adicionar"
        component={TelaLeituraCodigoBarras}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "add" : "add-outline"} size={26} color={focused ? theme.primary : theme.text} />
          ),
        }}
      />
      <Tab.Screen
        name="Ler QR Code"
        component={LerQRCodes}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "qr-code" : "qr-code-outline"} size={26} color={focused ? theme.primary : theme.text} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={TelaPerfil}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={26} color={focused ? theme.primary : theme.text} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={Tabs} />
      <Stack.Screen name="Temas" component={TelaTemas} />
    </Stack.Navigator>
  );
}

const estilos = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 22,
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    paddingTop: 12,
    paddingBottom: 12,
    zIndex: 10,
  },
});
