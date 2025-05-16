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
            <View style={estilos.bottomBarButton}>
              {focused ? (
                <View style={estilos.searchButtonCircle}>
                  <Ionicons name="home" size={22} color="#004d00" />
                </View>
              ) : (
                <Ionicons name="home-outline" size={24} color="white" />
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Buscar"
        component={TelaPesquisarFerramentas}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={estilos.bottomBarButton}>
              {focused ? (
                <View style={estilos.searchButtonCircle}>
                  <Ionicons name="search" size={22} color="#004d00" />
                </View>
              ) : (
                <Ionicons name="search-outline" size={24} color="white" />
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Adicionar"
        component={TelaLeituraCodigoBarras} 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={estilos.bottomBarButton}>
              {focused ? (
                <View style={estilos.searchButtonCircle}>
                  <Ionicons name="add" size={24} color="#004d00" />
                </View>
              ) : (
                <Ionicons name="add-outline" size={24} color="white" />
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={TelaPerfil}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={estilos.bottomBarButton}>
              {focused ? (
                <View style={estilos.searchButtonCircle}>
                  <Ionicons name="person" size={22} color="#004d00" />
                </View>
              ) : (
                <Ionicons name="person-outline" size={24} color="white" />
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const estilos = StyleSheet.create({
  bottomBar: {
    backgroundColor: '#001F07',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    paddingVertical: 5,
  },
  bottomBarButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: '100%',
    paddingBottom: 0.2, 
  },
  searchButtonCircle: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
