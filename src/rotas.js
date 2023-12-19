const express = require('express');

const rotas = express();

const { cadastrar, listar, login } = require('./controllers/usuarios');
const { } = require('./middlewares/usuarios');

rotas.get('/usuarios', listar);
rotas.post('/usuarios', cadastrar);
rotas.post('/login', login);

module.exports = rotas;
