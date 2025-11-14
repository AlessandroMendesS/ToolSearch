// controllers/authController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/authMiddleware');

// Controlador para cadastro de usuário
const register = async (req, res) => {
  try {
    const { nome, senha, confirmarSenha } = req.body;
    
    // Validações básicas
    if (!nome || !senha) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome e senha são obrigatórios' 
      });
    }
    
    if (senha !== confirmarSenha) {
      return res.status(400).json({ 
        success: false, 
        message: 'As senhas não coincidem' 
      });
    }
    
    // Verificar se o usuário já existe
    const existingUser = await User.findByName(nome);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este nome de usuário já está em uso' 
      });
    }
    
    // Criar o novo usuário
    const newUser = await User.create(nome, senha);
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: newUser.id, nome: newUser.nome },
      SECRET_KEY,
      { expiresIn: '24h' } // Token expira em 24 horas
    );
    
    // Responder com sucesso e o token
    res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      user: {
        id: newUser.id,
        nome: newUser.nome
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Controlador para login de usuário
const login = async (req, res) => {
  try {
    const { nome, senha } = req.body;
    
    // Validações básicas
    if (!nome || !senha) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome e senha são obrigatórios' 
      });
    }
    
    // Tentar autenticar o usuário
    const result = await User.authenticate(nome, senha);
    
    if (result.success) {
      // Gerar token JWT para o usuário autenticado
      const token = jwt.sign(
        { id: result.user.id, nome: result.user.nome },
        SECRET_KEY,
        { expiresIn: '24h' } // Token expira em 24 horas
      );
      
      // Responder com sucesso e o token
      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: result.user,
        token
      });
    } else {
      // Responder com erro se a autenticação falhou
      res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Controlador para verificar o status da autenticação (usuário logado)
const checkAuth = async (req, res) => {
  // Este controlador só é acessado após passar pelo middleware de verificação do token
  res.status(200).json({
    success: true,
    message: 'Usuário autenticado',
    user: {
      id: req.userId,
      nome: req.userName
    }
  });
};

// Controlador para atualizar dados do usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, nascimento, codigo, cargo } = req.body;

    // Verificar se o ID do token corresponde ao ID da rota
    if (req.userId !== parseInt(id, 10)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado: você só pode atualizar seu próprio perfil' 
      });
    }

    const updatedUser = await User.update(id, { nome, nascimento, codigo, cargo });

    if (updatedUser) {
      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        user: updatedUser
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Controlador para alterar a senha do usuário
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (req.userId !== parseInt(id, 10)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado: você só pode alterar sua própria senha' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'As novas senhas não coincidem' 
      });
    }

    const result = await User.changePassword(id, currentPassword, newPassword);

    if (result.success) {
      res.status(200).json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  register,
  login,
  checkAuth,
  updateUser,
  changePassword
};