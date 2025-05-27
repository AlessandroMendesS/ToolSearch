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
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.registrarDevolucao = async (req, res) => {
    const { id } = req.params;
    const { local_devolucao } = req.body;
    try {
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
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.buscarEmprestimoAberto = async (req, res) => {
    const { ferramenta_id } = req.params;
    try {
        const { data, error } = await supabase
            .from('emprestimos')
            .select('*')
            .eq('ferramenta_id', ferramenta_id)
            .eq('status', 'emprestado')
            .order('data_emprestimo', { ascending: false })
            .limit(1)
            .single();

        // Se não houver empréstimo aberto, data será null
        if (error && error.code !== 'PGRST116') throw error;

        res.json({ success: true, emprestimo: data || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}; 