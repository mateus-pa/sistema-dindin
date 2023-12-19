const pool = require('../database/conexao');

const transacoesController = {};

transacoesController.cadastrar = async (req, res) => {
    const usuario = req.usuario;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
        }

        if (tipo !== "entrada" && tipo !== "saida") {
            return res.status(400).json({ mensagem: 'O tipo de transação necessita ser entrada ou saida.' });
        }

        const { rowCount } = await pool.query(
            'select * from categorias where id = $1;',
            [categoria_id]
        );

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'A categoria informada não existe.' });
        }

        const { rows } = await pool.query(`insert into transacoes
        (descricao, valor, data, tipo, categoria_id, usuario_id)
        values ($1, $2, $3, $4, $5, $6)
        returning id;`, [descricao, valor, data, tipo, categoria_id, usuario.id]);

        const novaTransacao = await pool.query(`select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome
        from transacoes t
        join categorias c
        on t.categoria_id = c.id
        where t.id = $1;`, [rows[0].id]);

        return res.status(201).json(novaTransacao.rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}

module.exports = transacoesController;