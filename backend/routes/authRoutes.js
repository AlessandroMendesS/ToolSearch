// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

// Rota de registro de usuário
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);

// Rota para verificar o status da autenticação
router.get('/check', verificarToken, authController.checkAuth);

module.exports = router;