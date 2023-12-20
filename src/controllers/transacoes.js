const pool = require('../database/conexao');
const funcoes = require('../utils/funcoes');

const transacoesController = {};

transacoesController.listar = async (req, res) => {
    const usuario = req.usuario;

    try {
        const listaTransacoes = await pool.query(`select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome
        from transacoes t
        join categorias c
        on t.categoria_id = c.id
        where t.usuario_id = $1
        order by id asc;`, [usuario.id]);

        return res.status(200).json(listaTransacoes.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}

transacoesController.detalhar = async (req, res) => {
    const usuario = req.usuario;
    const { id } = req.params;

    try {
        const detalhesTransacao = await pool.query(`select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome
        from transacoes t
        join categorias c
        on t.categoria_id = c.id
        where t.usuario_id = $1
        and t.id = $2;`, [usuario.id, parseInt(id)]);

        if (detalhesTransacao.rowCount === 0) {
            return res.status(404).json({ mensagem: "Transação não encontrada." });
        }

        return res.status(200).json(detalhesTransacao.rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}

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

        const categoriaExiste = await funcoes.categoriaExiste(categoria_id);

        if (categoriaExiste === 0) {
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

transacoesController.atualizar = async (req, res) => {
    const usuario = req.usuario;
    const { id } = req.params;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
        }

        if (tipo !== "entrada" && tipo !== "saida") {
            return res.status(400).json({ mensagem: 'O tipo de transação necessita ser entrada ou saida.' });
        }

        const categoriaExiste = await funcoes.categoriaExiste(categoria_id);

        if (categoriaExiste === 0) {
            return res.status(400).json({ mensagem: 'A categoria informada não existe.' });
        }

        const transacaoExiste = await pool.query(
            `select *
            from transacoes
            where id = $1
            and usuario_id = $2;`, [parseInt(id), usuario.id]);

        if (transacaoExiste.rowCount === 0) {
            return res.status(400).json({ mensagem: 'A transação informada não existe.' });
        }

        await pool.query(`update transacoes
        set descricao = $1,
        valor = $2,
        data = $3,
        categoria_id = $4,
        tipo = $5
        where id = $6
        and usuario_id = $7;`, [descricao, valor, data, categoria_id, tipo, parseInt(id), usuario.id]);

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}

transacoesController.remover = async (req, res) => {
    const usuario = req.usuario;
    const { id } = req.params;

    try {
        const transacaoExiste = await pool.query(`select *
        from transacoes
        where id = $1
        and usuario_id = $2;`, [parseInt(id), usuario.id]);

        if (transacaoExiste.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada.' });
        }

        await pool.query(`delete
        from transacoes
        where id = $1
        and usuario_id = $2;`, [parseInt(id), usuario.id]);

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}

module.exports = transacoesController;