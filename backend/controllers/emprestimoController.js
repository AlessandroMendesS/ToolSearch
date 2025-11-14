const { supabase } = require('../config/db');

exports.registrarEmprestimo = async (req, res) => {
    const { ferramenta_id, usuario_id, local_emprestimo } = req.body;
    try {
        // Cria o registro de empréstimo
        const { data, error } = await supabase
            .from('emprestimos')
            .insert([{ ferramenta_id, usuario_id, local_emprestimo }])
            .select();

        if (error) throw error;

        // Atualiza status da ferramenta
        await supabase
            .from('ferramentas')
            .update({ disponivel: false })
            .eq('id', ferramenta_id);

        res.status(201).json({ success: true, emprestimo: data[0] });
    } catch (err) {
        console.error('Erro ao registrar empréstimo:', err); // Log detalhado do erro
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.registrarDevolucao = async (req, res) => {
    const { id } = req.params;
    const { local_devolucao } = req.body;
    try {
        // Busca o registro de empréstimo antes de alterar
        const { data: emprestimos, error: erroBusca } = await supabase
            .from('emprestimos')
            .select('*')
            .eq('id', id)
            .single();
        if (erroBusca) throw erroBusca;
        if (!emprestimos) return res.status(404).json({ success: false, message: 'Empréstimo não encontrado.' });

        // Checar se o usuário do token é o responsável pelo empréstimo
        if (req.userId !== emprestimos.usuario_id) {
            return res.status(403).json({ success: false, message: 'Você não é o responsável por este empréstimo. Apenas quem pegou a ferramenta pode devolvê-la.' });
        }

        // Atualiza o registro de empréstimo
        const { data, error } = await supabase
            .from('emprestimos')
            .update({
                data_devolucao: new Date().toISOString(),
                status: 'devolvido',
                local_devolucao
            })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Atualiza status da ferramenta
        const emprestimo = data[0];
        await supabase
            .from('ferramentas')
            .update({ disponivel: true })
            .eq('id', emprestimo.ferramenta_id);

        res.json({ success: true, devolucao: data[0] });
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
};

exports.buscarEmprestimoAberto = async (req, res) => {
    const { ferramenta_id } = req.params;
    try {
        // Buscar o último empréstimo registrado para essa ferramenta (emprestado ou devolvido)
        const { data, error } = await supabase
            .from('emprestimos')
            .select(`
                id,
                ferramenta_id,
                usuario_id,
                data_emprestimo,
                data_devolucao,
                status,
                local_emprestimo,
                usuarios ( nome )
            `)
            .eq('ferramenta_id', ferramenta_id)
            .order('data_emprestimo', { ascending: false })
            .limit(1)
            .single();
        // Se não houver empréstimo, continuar retornando null
        if (error && error.code !== 'PGRST116') throw error;
        res.json({ success: true, emprestimo: data || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}; 