# ToolSearch - Aplicativo de Gerenciamento de Ferramentas

Aplicativo em React Native para gerenciar ferramentas institucionais, controlar empréstimos e acompanhar o uso por diferentes usuários.

## Configuração do Backend (Supabase)

### 1. Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login ou crie uma conta
2. Clique em "New Project" e forneça um nome (ex: "toolsearch")
3. Escolha uma senha para o banco de dados PostgreSQL
4. Selecione a região mais próxima
5. Aguarde a criação do projeto (aproximadamente 2 minutos)

### 2. Executar scripts SQL

1. No painel do Supabase, acesse "SQL Editor" no menu lateral
2. Crie uma nova query e execute os scripts dos seguintes arquivos:
   - `db/schema.sql` - Para criação das tabelas e políticas de segurança
   - `db/functions.sql` - Para criar as funções e stored procedures

### 3. Configurar Storage

1. No painel do Supabase, acesse "Storage" no menu lateral
2. Crie dois buckets:
   - `ferramentas` - Para armazenar imagens das ferramentas
   - `grupos` - Para armazenar imagens dos grupos
3. Nas configurações de cada bucket:
   - Marque a opção "Public bucket" para permitir acesso público às imagens
   - Em "RLS" configure políticas para permitir leitura pública e escrita para usuários autenticados

### 4. Configurar Autenticação

1. No painel do Supabase, acesse "Authentication > Settings" no menu lateral
2. Em "Email Auth", ative "Enable Email Signup" e "Enable Email Confirmations"
3. Configure o domínio de redirecionamento para seu aplicativo

## Configuração do Projeto React Native

### 1. Configurar as variáveis do Supabase

1. No painel do Supabase, acesse "Settings > API" para obter as credenciais
2. Edite o arquivo `config/supabaseClient.js` com suas credenciais:

```javascript
const supabaseUrl = 'SUA_URL_DO_SUPABASE';
const supabaseAnonKey = 'SUA_CHAVE_ANON_KEY';
```

### 2. Instalar dependências

```bash
npm install
# ou
yarn install
```

### 3. Instalar dependências específicas

```bash
# Supabase
npm install @supabase/supabase-js

# AsyncStorage (para persistência de sessão)
npm install @react-native-async-storage/async-storage

# Expo FileSystem (para manipulação de imagens)
expo install expo-file-system
expo install expo-image-picker
```

### 4. Iniciar o projeto

```bash
npx expo start
```

## Estrutura do Projeto

```
/ToolSearch
  /assets
    /img           # Imagens e ícones
  /components      # Componentes reutilizáveis
  /config
    supabaseClient.js  # Cliente Supabase
  /controllers
    ferramentasController.js  # Controlador de ferramentas
    gruposController.js       # Controlador de grupos
    registroUsoController.js  # Controlador de registros
  /models
    ferramentaModel.js  # Modelo de ferramentas
    grupoModel.js       # Modelo de grupos
    registroUsoModel.js # Modelo de registros
  /screens
    TelaLogin.js        # Tela de login
    Home.js             # Tela inicial
    Perfil.js           # Perfil do usuário
    AdicionarFerramenta.js  # Cadastrar ferramenta
    TelaPesquisarFerramentas.js  # Busca de ferramentas
    TelaLeituraCodigoBarras.js  # Scanner de código de barras
  Navigation.js         # Navegação do app
```

## Funcionalidades

- **Autenticação de Usuários**
  - Login/Cadastro de usuários
  - Perfil com foto e informações

- **Gerenciamento de Ferramentas**
  - Cadastro com foto, detalhes e código de barras
  - Busca por nome, categoria ou código
  - Associação a grupos/categorias

- **Empréstimo e Devolução**
  - Registro de retirada e devolução de ferramentas
  - Controle de disponibilidade
  - Histórico de uso

- **Relatórios e Estatísticas**
  - Ferramentas mais utilizadas
  - Usuários com mais retiradas
  - Status atual das ferramentas

## Licença

Este projeto está licenciado sob a licença MIT. 