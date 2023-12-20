const express = require('express');

const rotas = express();

const usuariosController = require('./controllers/usuarios');
const categoriasController = require('./controllers/categorias');
const transacoesController = require('./controllers/transacoes');

const { validaToken } = require('./middlewares/usuarios');


rotas.get('/usuarios', usuariosController.listar);
rotas.post('/usuario', usuariosController.cadastrar);
rotas.post('/login', usuariosController.login);

rotas.use(validaToken);

rotas.get('/usuario', usuariosController.detalhar);
rotas.put('/usuario', usuariosController.atualizar);

rotas.get('/categoria', categoriasController.listar);

rotas.get('/transacao', transacoesController.listar);
rotas.get('/transacao/:id', transacoesController.detalhar);
rotas.post('/transacao', transacoesController.cadastrar);
rotas.delete('/transacao/:id', transacoesController.remover);

module.exports = rotas;
