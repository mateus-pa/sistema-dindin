const pool = require('../database/conexao');
const jwt = require('jsonwebtoken');

usuariosMiddlewares = {};

usuariosMiddlewares.validaToken = async (req, res, next) => {
    const { authorizations } = req.headers;

    try {
        if (!authorizations) {
            return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
        }

        const token = authorizations.split(' ')[1];

        const { id } = jwt.verify(token, process.env.JWT_PASSWORD);

        const { rows, rowCount } = await pool.query('select * from usuarios where id = $1;', [id]);

        if (rowCount === 0) {
            return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
        }

        const { senha, ...usuario } = rows[0];

        req.usuario = usuario;

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}

module.exports = usuariosMiddlewares;
