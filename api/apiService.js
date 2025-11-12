import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determinar a URL base da API com base na plataforma e modo de desenvolvimento
// __DEV__ é uma variável global do React Native que é 'true' durante o desenvolvimento
// (quando você roda no emulador ou web local) e 'false' em builds de produção.
const getApiUrl = () => {
  return 'https://backend-toolsearch.onrender.com/api';
};


const API_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000 
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('Fazendo requisição para:', config.url, config.method, config.baseURL);
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

apiClient.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', response.status);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error);

    if (error.response) {
      console.error('Erro do servidor:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Sem resposta do servidor. Verifique IP/conexão e se o servidor está rodando.');
      console.error('Detalhes do request:', error.request._url);
    } else {
      console.error('Erro na configuração da requisição:', error.message);
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição - o servidor demorou muito para responder');
    }

    if (error.message && error.message.includes('Network Error')) {
      console.error('Erro de rede - verifique sua conexão e se o servidor está acessível no IP correto');
    }

    return Promise.reject(error);
  }
);


export const authService = {
  
  register: async (userData) => {
    try {
      console.log('Tentando registrar usuário:', userData.nome);
      console.log('URL de registro:', `${API_URL}/auth/register`);

      const response = await apiClient.post('/auth/register', userData);

      if (response.data.token) {
  
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Erro completo no registro:', error);
      if (error.response) {
        console.error('Erro do servidor:', error.response.status, error.response.data);
        return error.response.data;
      } else if (error.request) {
        console.error('Sem resposta do servidor. Detalhes:', error.request._url);
        return {
          success: false,
          message: 'Servidor não respondeu. Verifique se o backend está rodando e acessível no IP correto.'
        };
      } else {
        console.error('Erro na configuração da requisição:', error.message);
        return { success: false, message: 'Erro ao configurar requisição: ' + error.message };
      }
    }
  },

  login: async (credentials) => {
    try {
      console.log('Tentando login com:', credentials.nome);
      console.log('URL de login:', `${API_URL}/auth/login`);

      const response = await apiClient.post('/auth/login', credentials);

      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Erro completo no login:', error);
      if (error.response) {
        return error.response.data;
      } else if (error.request) {
        return {
          success: false,
          message: 'Servidor não respondeu. Verifique se o backend está rodando e acessível no IP correto.'
        };
      } else {
        return { success: false, message: 'Erro ao configurar requisição: ' + error.message };
      }
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      throw { message: 'Erro ao fazer logout' };
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        return { isAuthenticated: false };
      }

      const response = await apiClient.get('/auth/check');
      return { isAuthenticated: true, user: response.data.user };
    } catch (error) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { isAuthenticated: false };
    }
  },

  testConnection: async () => {
    try {
      console.log('Testando conexão com:', `${API_URL}/test`);
      const response = await apiClient.get('/test');
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      let mensagem = 'Erro de conexão';

      if (error.request) {
        mensagem = `Servidor não encontrado. Verifique se o backend está rodando no IP correto: ${API_URL}`;
      }

      return { success: false, message: mensagem };
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/auth/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

export const emprestimoService = {
  registrarEmprestimo: async ({ ferramenta_id, usuario_id, local_emprestimo }) => {
    const response = await apiClient.post('/emprestimos', {
      ferramenta_id,
      usuario_id,
      local_emprestimo
    });
    return response.data;
  },
  registrarDevolucao: async (emprestimo_id, { local_devolucao }) => {
    const response = await apiClient.put(`/emprestimos/${emprestimo_id}/devolucao`, {
      local_devolucao
    });
    return response.data;
  },
  buscarEmprestimoAberto: async (ferramenta_id) => {
    const response = await apiClient.get(`/emprestimos/aberto/${ferramenta_id}`);
    return response.data;
  }
};

export const toolService = {
  getMostUsedTools: async () => {
    const response = await apiClient.get('/ferramentas/mais-utilizadas');
    return response.data;
  },
  deleteTool: async (toolId) => {
    try {
      const response = await apiClient.delete(`/ferramentas/${toolId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar ferramenta via API:', error);
      throw error;
    }
  },
};

export default apiClient;
