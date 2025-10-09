// routes/toolRoutes.js
const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');
const { verificarToken } = require('../middleware/authMiddleware');

// Rota para obter ferramentas mais utilizadas
router.get('/mais-utilizadas', toolController.getMostUsedTools);

// Rota para cadastrar nova ferramenta (sem autenticação durante desenvolvimento)
router.post('/', toolController.createTool);

// Rota para obter todas as ferramentas
router.get('/', toolController.getAllTools);

// Rota para obter ferramentas por categoria
router.get('/categoria/:categoryId', toolController.getToolsByCategory);

// Rota para obter ferramenta pelo ID
router.get('/:id', toolController.getToolById);

// Rota para upload de imagem (sem autenticação durante desenvolvimento)
router.post('/upload', toolController.uploadImage);

// Rota para atualizar o QR Code (sem autenticação durante desenvolvimento)
router.put('/:id/qrcode', toolController.updateQrCode);

module.exports = router; 