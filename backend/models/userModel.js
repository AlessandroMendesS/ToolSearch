// models/userModel.js
const { supabase } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Método para criar um novo usuário
  static async create(nome, senha) {
    try {
      // Hash da senha antes de armazenar no banco de dados
      const hashedSenha = await bcrypt.hash(senha, 10);
      
      // Inserir usuário no Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          { nome, senha: hashedSenha }
        ])
        .select();
      
      if (error) {
        if (error.code === '23505') { // Código de erro para violação de chave única
          throw new Error('Este nome de usuário já está em uso');
        }
        throw new Error('Erro ao cadastrar usuário: ' + error.message);
      }
      
      return {
        id: data[0].id,
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
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nome', nome)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
        throw new Error('Erro ao buscar usuário: ' + error.message);
      }
      
      return data;
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

  // Método para atualizar um usuário
  static async update(id, fields) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(fields)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error('Erro ao atualizar usuário: ' + error.message);
      }

      if (data.length === 0) {
        return null; // Usuário não encontrado
      }

      return data[0];
    } catch (error) {
      throw new Error('Erro ao atualizar usuário: ' + error.message);
    }
  }
}

module.exports = User;