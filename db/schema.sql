                      -- Criar tabela de ferramentas
CREATE TABLE IF NOT EXISTS public.ferramentas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  patrimonio VARCHAR(100) NOT NULL,
  detalhes TEXT,
  local VARCHAR(255) NOT NULL,
  categoria_id VARCHAR(50) NOT NULL,
  categoria_nome VARCHAR(100) NOT NULL,
  imagem_url TEXT,
  qrcode_url TEXT,
  disponivel BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  adicionado_por INTEGER
);

-- Desativar RLS para desenvolvimento (pode ativá-la em produção)
ALTER TABLE public.ferramentas DISABLE ROW LEVEL SECURITY;

-- Criar função para criar a tabela ferramentas (caso ela ainda não exista)
CREATE OR REPLACE FUNCTION public.create_ferramentas_table()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'ferramentas') THEN
    CREATE TABLE public.ferramentas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      patrimonio VARCHAR(100) NOT NULL,
      detalhes TEXT,
      local VARCHAR(255) NOT NULL,
      categoria_id VARCHAR(50) NOT NULL,
      categoria_nome VARCHAR(100) NOT NULL,
      imagem_url TEXT,
      qrcode_url TEXT,
      disponivel BOOLEAN DEFAULT true,
      data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      adicionado_por INTEGER
    );
    
    -- Desativar RLS para desenvolvimento (pode ativá-la em produção)
    ALTER TABLE public.ferramentas DISABLE ROW LEVEL SECURITY;
  END IF;
END;
$$ LANGUAGE plpgsql; 