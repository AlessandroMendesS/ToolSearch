// Configuração ajustada do Supabase para resolver o erro de RLS

// config/db.js (modificado)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Usar variáveis de ambiente para as credenciais do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem ser definidas no arquivo .env');
  process.exit(1);
}

// Criar cliente do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Script para configurar a tabela de usuários no Supabase
const setupDatabase = async () => {
  try {
    // Verificar se podemos conectar ao banco
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error);
      
      // Verificar se o erro é relacionado ao RLS
      if (error.message && error.message.includes('policy')) {
        console.error('ERRO DE POLÍTICA RLS: Você precisa configurar as políticas de segurança no Supabase.');
        console.error(`
          Acesse o painel do Supabase em ${SUPABASE_URL.replace('.co', '.com')},
          vá para "Authentication" > "Policies" e:
          
          1. Desative temporariamente o RLS (apenas para desenvolvimento) ou
          2. Adicione políticas de inserção para a tabela "usuarios"
        `);
      } else {
        console.log('Você precisa criar a tabela "usuarios" no Supabase manualmente.');
        console.log('Execute o seguinte SQL no editor SQL do Supabase:');
        console.log(`
          CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Importante: depois de criar a tabela, configure as políticas RLS
          -- ou desative o RLS para esta tabela (apenas em desenvolvimento)
        `);
      }
    } else {
      console.log('Conexão com Supabase estabelecida com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao configurar conexão com Supabase:', error);
  }
};

module.exports = {
  supabase,
  setupDatabase
};