const express = require('express');
const router = express.Router();
const { registrarEmprestimo, registrarDevolucao, buscarEmprestimoAberto } = require('../controllers/emprestimoController');
const { verificarToken } = require('../middleware/authMiddleware');

router.post('/', registrarEmprestimo); // POST /api/emprestimos
router.put('/:id/devolucao', verificarToken, registrarDevolucao); // PUT /api/emprestimos/:id/devolucao
router.get('/aberto/:ferramenta_id', buscarEmprestimoAberto);

module.exports = router; 