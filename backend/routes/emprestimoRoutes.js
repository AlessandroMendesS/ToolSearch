const express = require('express');
const router = express.Router();
const { registrarEmprestimo, registrarDevolucao, buscarEmprestimoAberto } = require('../controllers/emprestimoController');

router.post('/', registrarEmprestimo); // POST /api/emprestimos
router.put('/:id/devolucao', registrarDevolucao); // PUT /api/emprestimos/:id/devolucao
router.get('/aberto/:ferramenta_id', buscarEmprestimoAberto);

module.exports = router; 