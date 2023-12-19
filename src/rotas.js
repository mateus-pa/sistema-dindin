const express = require('express');

const rotas = express();

const {
    cadastrar,
    listar,
    login,
    detalhar,
    atualizar,
} = require('./controllers/usuarios');

const transacoesController = require('./controllers/transacoes');

const { validaToken } = require('./middlewares/usuarios');

rotas.get('/usuarios', listar);
rotas.post('/usuario', cadastrar);
rotas.post('/login', login);

rotas.use(validaToken);

rotas.get('/usuario', detalhar);
rotas.put('/usuario', atualizar);

rotas.post('/transacao', transacoesController.cadastrar);

module.exports = rotas;
