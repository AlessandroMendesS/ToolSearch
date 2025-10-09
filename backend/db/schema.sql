-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias de ferramentas
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    imagem_url TEXT DEFAULT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de ferramentas
CREATE TABLE IF NOT EXISTS ferramentas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    detalhes TEXT,
    local VARCHAR(100) NOT NULL,
    patrimonio VARCHAR(50) NOT NULL UNIQUE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    adicionado_por INTEGER NOT NULL REFERENCES usuarios(id),
    imagem_url TEXT DEFAULT NULL,
    qrcode_url TEXT DEFAULT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de empréstimos
CREATE TABLE IF NOT EXISTS emprestimos (
    id SERIAL PRIMARY KEY,
    ferramenta_id INTEGER NOT NULL REFERENCES ferramentas(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    data_emprestimo TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_devolucao TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'emprestado', -- emprestado, devolvido
    observacoes TEXT
);

-- Inserir categorias padrão
INSERT INTO categorias (nome)
VALUES ('Furadeiras'), ('Chaves'), ('Alicates'), ('Medidores'), ('Serras'), ('Outros')
ON CONFLICT (nome) DO NOTHING;

-- Políticas de segurança
-- As políticas abaixo são exemplos. Ajuste conforme necessário.

-- Desativar RLS por padrão (para desenvolvimento - em produção deve estar ON)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE ferramentas DISABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos DISABLE ROW LEVEL SECURITY;

-- Habilitar RLS para as tabelas (quando estiver pronto para produção)
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY; 