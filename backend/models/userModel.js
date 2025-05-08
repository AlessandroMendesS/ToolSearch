// models/userModel.js
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Método para criar um novo usuário
  static async create(nome, senha) {
    try {
      // Hash da senha antes de armazenar no banco de dados
      const hashedSenha = await bcrypt.hash(senha, 10);
      
      // Inserir usuário no banco de dados
      const [result] = await pool.query(
        'INSERT INTO usuarios (nome, senha) VALUES (?, ?)',
        [nome, hashedSenha]
      );
      
      return {
        id: result.insertId,
        nome,
        message: 'Usuário cadastrado com sucesso!'
      };
    } catch (error) {
      throw new Error('Erro ao cadastrar usuário: ' + error.message);
    }
  }

  // Método para encontrar um usuário pelo nome
  static async findByName(nome) {
    try {
      const [rows] = await pool.query('SELECT * FROM usuarios WHERE nome = ?', [nome]);
      
      if (rows.length > 0) {
        return rows[0];
      }
      
      return null;
    } catch (error) {
      throw new Error('Erro ao buscar usuário: ' + error.message);
    }
  }

  // Método para verificar credenciais de login
  static async authenticate(nome, senha) {
    try {
      // Buscar usuário pelo nome
      const user = await this.findByName(nome);
      
      if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
      }
      
      // Verificar se a senha está correta
      const senhaCorreta = await bcrypt.compare(senha, user.senha);
      
      if (senhaCorreta) {
        return {
          success: true,
          user: {
            id: user.id,
            nome: user.nome
          },
          message: 'Login realizado com sucesso!'
        };
      } else {
        return { success: false, message: 'Senha incorreta' };
      }
    } catch (error) {
      throw new Error('Erro na autenticação: ' + error.message);
    }
  }
}

module.exports = User;