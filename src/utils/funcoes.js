const pool = require('../database/conexao');
const funcoes = {}

funcoes.categoriaExiste = async (categoria_id) => {
    const { rows } = await pool.query(
        'select count(*) from categorias where id = $1;',
        [categoria_id]
    );
    return parseInt(rows[0].count);
}

module.exports = funcoes;