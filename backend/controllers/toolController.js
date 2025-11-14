const Tool = require('../models/toolModel');
const { supabase } = require('../config/db');

// Cadastrar nova ferramenta
const createTool = async (req, res) => {
    try {
        const { nome, detalhes, local, patrimonio, categoria, imagem_url } = req.body;

        // Validar dados
        if (!nome || !patrimonio || !local || !categoria) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios não preenchidos'
            });
        }

        // Usar um ID fixo para usuário em desenvolvimento
        // Evitando problema de autenticação
        const userId = 1; // ID fixo para testes

        // Criar ferramenta
        const result = await Tool.create({
            nome,
            detalhes,
            local,
            patrimonio,
            categoria,
            adicionadoPor: userId,
            imagem_url
        });

        if (result.success) {
            return res.status(201).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao cadastrar ferramenta: ' + error.message
        });
    }
};

// Obter todas as ferramentas
const getAllTools = async (req, res) => {
    try {
        const result = await Tool.findAll();

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar ferramentas: ' + error.message
        });
    }
};

// Obter ferramentas por categoria
const getToolsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const result = await Tool.findByCategory(categoryId);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar ferramentas: ' + error.message
        });
    }
};

// Obter ferramenta pelo ID
const getToolById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Tool.findById(id);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar ferramenta: ' + error.message
        });
    }
};

// Upload de imagem
const uploadImage = async (req, res) => {
    try {
        const { file, fileName } = req.body;

        if (!file || !fileName) {
            return res.status(400).json({
                success: false,
                message: 'Arquivo ou nome do arquivo não fornecido'
            });
        }

        const result = await Tool.uploadImage(file, fileName);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao fazer upload da imagem: ' + error.message
        });
    }
};

// Atualizar QR Code da ferramenta
const updateQrCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { qrCodeUrl } = req.body;

        if (!qrCodeUrl) {
            return res.status(400).json({
                success: false,
                message: 'URL do QR Code não fornecida'
            });
        }

        try {
            // Atualizar o QR Code no banco de dados
            const { data, error } = await supabase
                .from('ferramentas')
                .update({ qrcode_url: qrCodeUrl })
                .eq('id', id);

            if (error) {
                throw error;
            }

            return res.status(200).json({
                success: true,
                message: 'QR Code atualizado com sucesso'
            });
        } catch (dbError) {
            console.error('Erro no Supabase:', dbError);
            return res.status(400).json({
                success: false,
                message: 'Erro ao atualizar QR Code: ' + dbError.message
            });
        }
    } catch (error) {
        console.error('Erro geral:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao atualizar QR Code: ' + error.message
        });
    }
};

// Definir a função getMostUsedTools AQUI
const getMostUsedTools = async (req, res) => {
    try {
        const { data: toolsData, error: toolsError } = await supabase
            .from('ferramentas')
            .select(`
                id,
                nome,
                imagem_url,
                disponivel,
                local,
                detalhes,
                patrimonio,
                emprestimos ( count )
            `);

        if (toolsError) {
            console.error('Supabase error fetching tools for most used:', toolsError);
            throw toolsError;
        }

        const toolsWithLoanCounts = toolsData.map(tool => ({
            ...tool,
            loan_count: tool.emprestimos && tool.emprestimos.length > 0 ? tool.emprestimos[0].count : 0,
        })).sort((a, b) => b.loan_count - a.loan_count);

        // Limit to a certain number, e.g., top 6, or send all and let frontend decide
        const topTools = toolsWithLoanCounts.slice(0, 6); // Get top 6 most used tools

        res.json({ success: true, tools: topTools });

    } catch (err) {
        console.error('Error in getMostUsedTools controller:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar ferramentas mais utilizadas: ' + (err.message || 'Erro desconhecido') });
    }
};

module.exports = {
    createTool,
    getAllTools,
    getToolsByCategory,
    getToolById,
    uploadImage,
    updateQrCode,
    getMostUsedTools
}; 