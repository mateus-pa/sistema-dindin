const express = require('express');

const rotas = express();

const {
    cadastrar,
    listar,
    login,
    detalhar,
    atualizar,
} = require('./controllers/usuarios');

const { validaToken } = require('./middlewares/usuarios');

rotas.get('/usuarios', listar);
rotas.post('/usuarios', cadastrar);
rotas.post('/login', login);

rotas.use(validaToken);

rotas.get('/usuario', detalhar);
rotas.put('/usuario', atualizar);

module.exports = rotas;
