// config/db.js
const mysql = require('mysql2');

// Criar uma pool de conexões com o MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Substitua pelo seu usuário do MySQL
  password: 'alessandro',      // Substitua pela sua senha do MySQL
  database: 'app_ferramenta',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Converter a pool em uma versão que suporta promises
const promisePool = pool.promise();

// Script para criar a tabela de usuários se não existir
const setupDatabase = async () => {
  try {
    // Verificar se o banco de dados existe, se não, criar
    await promisePool.query(`CREATE DATABASE IF NOT EXISTS app_ferramenta`);
    
    // Usar o banco de dados
    await promisePool.query(`USE app_ferramenta`);
    
    // Criar tabela de usuários se não existir
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        senha VARCHAR(255) NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Banco de dados configurado com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
  }
};

module.exports = {
  pool: promisePool,
  setupDatabase
};