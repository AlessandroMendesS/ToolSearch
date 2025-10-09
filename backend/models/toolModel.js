const { supabase } = require('../config/db');

class Tool {
    // Método para criar uma nova ferramenta
    static async create(toolData) {
        try {
            // Inserir ferramenta no Supabase
            const { data, error } = await supabase
                .from('ferramentas')
                .insert([
                    {
                        nome: toolData.nome,
                        detalhes: toolData.detalhes,
                        local: toolData.local,
                        patrimonio: toolData.patrimonio,
                        categoria_id: toolData.categoria,
                        adicionado_por: toolData.adicionadoPor,
                        imagem_url: toolData.imagem_url
                    }
                ])
                .select();

            if (error) {
                throw new Error('Erro ao cadastrar ferramenta: ' + error.message);
            }

            const ferramentaCriada = data[0];
            // Gerar a URL pública para o QR Code usando o patrimônio
            const qrcodeUrl = `https://gugursnnzngieaztnzjg.supabase.co/ferramentas/${ferramentaCriada.patrimonio}`;

            // Atualizar o campo qrcode_url
            const { error: updateError } = await supabase
                .from('ferramentas')
                .update({ qrcode_url: qrcodeUrl })
                .eq('id', ferramentaCriada.id);

            if (updateError) {
                throw new Error('Erro ao atualizar qrcode_url: ' + updateError.message);
            }

            // Buscar o registro atualizado
            const { data: ferramentaAtualizada, error: fetchError } = await supabase
                .from('ferramentas')
                .select('*')
                .eq('id', ferramentaCriada.id)
                .single();

            if (fetchError) {
                throw new Error('Erro ao buscar ferramenta atualizada: ' + fetchError.message);
            }

            return {
                success: true,
                tool: ferramentaAtualizada,
                message: 'Ferramenta cadastrada com sucesso!'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erro ao cadastrar ferramenta: ' + error.message
            };
        }
    }

    // Método para buscar todas as ferramentas
    static async findAll() {
        try {
            const { data, error } = await supabase
                .from('ferramentas')
                .select('*');

            if (error) {
                throw new Error('Erro ao buscar ferramentas: ' + error.message);
            }

            return {
                success: true,
                tools: data
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erro ao buscar ferramentas: ' + error.message
            };
        }
    }

    // Método para buscar ferramentas por categoria
    static async findByCategory(categoryId) {
        try {
            const { data, error } = await supabase
                .from('ferramentas')
                .select('*')
                .eq('categoria_id', categoryId);

            if (error) {
                throw new Error('Erro ao buscar ferramentas: ' + error.message);
            }

            return {
                success: true,
                tools: data
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erro ao buscar ferramentas: ' + error.message
            };
        }
    }

    // Método para buscar uma ferramenta pelo ID
    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('ferramentas')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                throw new Error('Erro ao buscar ferramenta: ' + error.message);
            }

            return {
                success: true,
                tool: data
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erro ao buscar ferramenta: ' + error.message
            };
        }
    }

    // Método para fazer upload de imagem da ferramenta
    static async uploadImage(file, fileName) {
        try {
            const { data, error } = await supabase.storage
                .from('ferramentas-imagens')
                .upload(fileName, file);

            if (error) {
                throw new Error('Erro ao fazer upload da imagem: ' + error.message);
            }

            // Obter a URL pública da imagem
            const { publicURL } = supabase.storage
                .from('ferramentas-imagens')
                .getPublicUrl(fileName);

            return {
                success: true,
                url: publicURL,
                message: 'Imagem enviada com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Erro ao fazer upload da imagem: ' + error.message
            };
        }
    }
}

module.exports = Tool; 