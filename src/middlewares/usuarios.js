const pool = require('../database/conexao');
const jwt = require('jsonwebtoken');

usuariosMiddlewares = {};

usuariosMiddlewares.validaToken = async (req, res, next) => {
    const { authorization } = req.headers;

    try {
        if (!authorization) {
            return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' });
        }

        const token = authorization.split(' ')[1];

        const { id } = jwt.verify(token, process.env.JWT_PASSWORD);

        const { rows, rowCount } = await pool.query('select * from usuarios where id = $1;', [id]);

        if (rowCount === 0) {
            return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' });
        }

        const { senha, ...usuario } = rows[0];

        req.usuario = usuario;

        next();
    } catch (error) {
        if (error.message === 'invalid signature') {
            return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' });
        }

        if (error.message === 'jwt expired') {
            return res.status(401).json({ mensagem: 'Token expirado. Para acessar este recurso um token de autenticação válido deve ser enviado.' })
        }

        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}

module.exports = usuariosMiddlewares;
