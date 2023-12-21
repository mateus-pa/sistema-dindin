const express = require('express');
require('dotenv').config();

const app = express();

const rotas = require('./rotas');

app.use(express.json());

app.use(rotas);

app.listen(process.env.PORT);
