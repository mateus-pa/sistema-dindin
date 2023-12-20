const pool = require('../database/conexao');

const categoriasController = {};

categoriasController.listar = async (req, res) => {

    try {
        const listaCategorias = await pool.query('select * from categorias');

        return res.status(200).json(listaCategorias.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}

module.exports = categoriasController;