import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determinar a URL base da API com base na plataforma
// Para web: use localhost
// Para dispositivos móveis: use o IP da máquina na rede local
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  } else {
    // Use o IP do seu computador na rede para dispositivos físicos
    // Você pode precisar alterar este IP para o correto da sua rede
    return 'http://1.1.1.1:3000/api';
  }
};

const API_URL = getApiUrl();
console.log('Usando API URL:', API_URL); // Para debug

// Configuração do cliente Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Aumentar timeout para dar mais tempo para a resposta
  timeout: 10000 
});

// Interceptor para adicionar o token às requisições
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('Fazendo requisição para:', config.url, config.method);
      return config;
    } catch (error) {
      console.error('Erro no interceptor de requisição:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Erro ao processar requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
apiClient.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', response.status);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error);
    // Verifica se é erro de timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição');
    }
    // Verifica se é erro de rede
    if (error.message && error.message.includes('Network Error')) {
      console.error('Erro de rede - verifique se o servidor está rodando');
    }
    return Promise.reject(error);
  }
);

// Serviço de autenticação
export const authService = {
  // Registrar um novo usuário
  register: async (userData) => {
    try {
      console.log('Tentando registrar usuário:', userData.nome);
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.token) {
        // Armazenar token e dados do usuário localmente
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro completo no registro:', error);
      if (error.response) {
        // O servidor respondeu com um status diferente de 2xx
        console.error('Erro do servidor:', error.response.status, error.response.data);
        return error.response.data;
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error('Sem resposta do servidor:', error.request);
        return { success: false, message: 'Servidor não respondeu. Verifique se o backend está rodando.' };
      } else {
        // Erro na configuração da requisição
        console.error('Erro na configuração da requisição:', error.message);
        return { success: false, message: 'Erro ao configurar requisição: ' + error.message };
      }
    }
  },
  
  // Login de usuário
  login: async (credentials) => {
    try {
      console.log('Tentando login com:', credentials.nome);
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.token) {
        // Armazenar token e dados do usuário localmente
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro completo no login:', error);
      if (error.response) {
        return error.response.data;
      } else if (error.request) {
        return { success: false, message: 'Servidor não respondeu. Verifique se o backend está rodando.' };
      } else {
        return { success: false, message: 'Erro ao configurar requisição: ' + error.message };
      }
    }
  },
  
  // Logout de usuário
  logout: async () => {
    try {
      // Remover token e dados do usuário do armazenamento local
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      throw { message: 'Erro ao fazer logout' };
    }
  },
  
  // Verificar se o usuário está autenticado
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        return { isAuthenticated: false };
      }
      
      const response = await apiClient.get('/auth/check');
      return { isAuthenticated: true, user: response.data.user };
    } catch (error) {
      // Se houver erro na verificação, considerar como não autenticado
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { isAuthenticated: false };
    }
  },
  
  // Método de teste para verificar a conexão com o backend
  testConnection: async () => {
    try {
      const response = await apiClient.get('/test');
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default apiClient;
