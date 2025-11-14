const express = require('express');
const cors = require('cors');
const { setupDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const toolRoutes = require('./routes/toolRoutes');
const emprestimoRoutes = require('./routes/emprestimoRoutes');

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar middleware
app.use(cors({
  // Permitir qualquer origem em desenvolvimento
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parsear requisições com JSON

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configurar rotas
app.use('/api/auth', authRoutes);
app.use('/api/ferramentas', toolRoutes);
app.use('/api/emprestimos', emprestimoRoutes);

// Rota principal para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('API do aplicativo de gerenciamento de ferramentas está funcionando!');
});

// Rota de teste adicional para frontend verificar a API
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API do aplicativo está funcionando corretamente com Supabase!'
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno no servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Inicializar o banco de dados e iniciar o servidor
const startServer = async () => {
  try {
    // Verificar conexão com Supabase
    await setupDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();