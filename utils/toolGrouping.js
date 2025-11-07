/**
 * Utilitário para agrupar ferramentas por nome e calcular disponibilidade
 */

/**
 * Agrupa ferramentas por nome e categoria, calculando quantidade total e disponível
 * @param {Array} ferramentas - Array de ferramentas individuais
 * @returns {Array} Array de grupos de ferramentas com informações agregadas
 */
export const agruparFerramentas = (ferramentas) => {
  if (!ferramentas || ferramentas.length === 0) {
    return [];
  }

  // Agrupar por nome e categoria_id
  const gruposMap = new Map();

  ferramentas.forEach(ferramenta => {
    // Chave única para agrupamento: nome + categoria_id
    const chave = `${ferramenta.nome}_${ferramenta.categoria_id || 'sem_categoria'}`;
    
    if (!gruposMap.has(chave)) {
      gruposMap.set(chave, {
        id: chave, // ID do grupo (pode ser usado para navegação)
        nome: ferramenta.nome,
        categoria_id: ferramenta.categoria_id,
        categoria_nome: ferramenta.categoria_nome,
        imagem_url: ferramenta.imagem_url,
        detalhes: ferramenta.detalhes,
        local: ferramenta.local,
        total: 0,
        disponivel: 0,
        ferramentas: [], // Array com todas as ferramentas individuais do grupo
        // Dados representativos (da primeira ferramenta do grupo)
        patrimonio_base: ferramenta.patrimonio,
        adicionado_por: ferramenta.adicionado_por,
        data_criacao: ferramenta.data_criacao,
      });
    }

    const grupo = gruposMap.get(chave);
    grupo.total++;
    if (ferramenta.disponivel) {
      grupo.disponivel++;
    }
    grupo.ferramentas.push(ferramenta);
  });

  // Converter Map para Array e ordenar por nome
  return Array.from(gruposMap.values()).sort((a, b) => 
    a.nome.localeCompare(b.nome)
  );
};

/**
 * Busca uma ferramenta disponível do grupo para empréstimo
 * @param {Object} grupo - Grupo de ferramentas
 * @returns {Object|null} Primeira ferramenta disponível ou null
 */
export const buscarFerramentaDisponivel = (grupo) => {
  if (!grupo || !grupo.ferramentas) {
    return null;
  }
  
  return grupo.ferramentas.find(f => f.disponivel) || null;
};

/**
 * Obtém todas as ferramentas disponíveis de um grupo
 * @param {Object} grupo - Grupo de ferramentas
 * @returns {Array} Array de ferramentas disponíveis
 */
export const obterFerramentasDisponiveis = (grupo) => {
  if (!grupo || !grupo.ferramentas) {
    return [];
  }
  
  return grupo.ferramentas.filter(f => f.disponivel);
};

/**
 * Obtém todas as ferramentas emprestadas de um grupo
 * @param {Object} grupo - Grupo de ferramentas
 * @returns {Array} Array de ferramentas emprestadas
 */
export const obterFerramentasEmprestadas = (grupo) => {
  if (!grupo || !grupo.ferramentas) {
    return [];
  }
  
  return grupo.ferramentas.filter(f => !f.disponivel);
};

/**
 * Formata a exibição do patrimônio
 * Se o patrimônio começar com "SEM PATRIMONIO", mostra apenas "SEM PATRIMONIO"
 * @param {string} patrimonio - Número de patrimônio da ferramenta
 * @returns {string} Patrimônio formatado para exibição
 */
export const formatarPatrimonio = (patrimonio) => {
  if (!patrimonio) return '';
  if (patrimonio.startsWith('SEM PATRIMONIO')) {
    return 'SEM PATRIMONIO';
  }
  return patrimonio;
};

