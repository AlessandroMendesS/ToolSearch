// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'sua_chave_secreta_jwt'; // Use variável de ambiente em produção

// Middleware para verificar se o usuário está autenticado
const verificarToken = (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token não fornecido' 
    });
  }

  // O formato do token é "Bearer [token]"
  const token = authHeader.split(' ')[1];
  
  try {
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Adicionar o usuário decodificado à requisição
    req.userId = decoded.id;
    req.userName = decoded.nome;
    
    // Continuar para o próximo middleware ou controlador
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    });
  }
};

module.exports = {
  verificarToken,
  SECRET_KEY
};