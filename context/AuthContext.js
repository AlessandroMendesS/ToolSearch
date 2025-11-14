
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/apiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');

        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          setAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);


  const login = async (credentials) => {
    try {
      console.log('Tentando login com:', credentials.nome);
      const response = await authService.login(credentials);

      if (response.success) {
        console.log('Login bem-sucedido:', response.user);
        setUser(response.user);
        setAuthenticated(true);

        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        return { success: true };
      } else {
        console.warn('Falha no login:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      return {
        success: false,
        message: error.message || 'Erro ao conectar com o servidor'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);

      if (response.success) {
        setUser(response.user);
        setAuthenticated(true);
        return { success: true, user: response.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAuthenticated(false);
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const checkAuth = async () => {
    try {
      const result = await authService.checkAuth();
      setAuthenticated(result.isAuthenticated);

      if (result.isAuthenticated) {
        setUser(result.user);
      } else {
        setUser(null);
      }

      return result;
    } catch (error) {
      setAuthenticated(false);
      setUser(null);
      return { isAuthenticated: false };
    }
  };

  const updateUserImage = async (newImageUrl) => {
    if (user) {
      const updatedUser = { ...user, imagemPerfil: newImageUrl };
      setUser(updatedUser);
      try {
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Erro ao salvar imagem do perfil no AsyncStorage:", error);
      }
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await authService.updateUser(userId, userData);
      if (response.success) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    loading,
    authenticated,
    login,
    register,
    logout,
    checkAuth,
    updateUserImage,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};