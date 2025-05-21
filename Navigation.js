import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TelaInicial from './screens/Home';
import TelaPerfil from './screens/Perfil';
import TelaLeituraCodigoBarras from './screens/TelaLeituraCodigoBarras';
import TelaPesquisarFerramentas from './screens/TelaPesquisarFerramentas';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: estilos.bottomBar,
      }}
    >
      <Tab.Screen
        name="Início"
        component={TelaInicial}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? "#7DA38C" : "#fff"} />
          ),
        }}
      />
      <Tab.Screen
        name="Buscar"
        component={TelaPesquisarFerramentas}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={24} color={focused ? "#7DA38C" : "#fff"} />
          ),
          unmountOnBlur: true
        }}
      />
      <Tab.Screen
        name="Adicionar"
        component={TelaLeituraCodigoBarras}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "add" : "add-outline"} size={28} color={focused ? "#7DA38C" : "#fff"} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={TelaPerfil}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? "#7DA38C" : "#fff"} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const estilos = StyleSheet.create({
  bottomBar: {
    backgroundColor: '#14351c',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    paddingVertical: 5,
    zIndex: 10,
  },
});
