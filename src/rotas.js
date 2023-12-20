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

rotas.get('/transacao', transacoesController.listar);
rotas.get('/transacao/:id', transacoesController.detalhar);
rotas.post('/transacao', transacoesController.cadastrar);
rotas.delete('/transacao/:id', transacoesController.remover);

module.exports = rotas;
