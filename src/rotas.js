const express = require('express');

const rotas = express();

const usuariosController = require('./controllers/usuarios');
const usuariosMiddleware = require('./middlewares/usuarios');

rotas.post('/usuarios', usuariosController.cadastrar);

module.exports = rotas;