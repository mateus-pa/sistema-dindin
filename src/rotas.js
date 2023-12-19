const express = require('express');

const rotas = express();

const { cadastrar, listar } = require('./controllers/usuarios');
const {} = require('./middlewares/usuarios');

rotas.get('/usuarios', listar);
rotas.post('/usuarios', cadastrar);

module.exports = rotas;
