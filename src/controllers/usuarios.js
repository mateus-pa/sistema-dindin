const pool = require('../database/conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usuariosController = {};

usuariosController.cadastrar = async function (req, res) {
  const { nome, email, senha } = req.body;

  try {
    if (!nome) {
      return res.status(400).json({ mensagem: 'O campo nome é obrigatório.' });
    }

    if (!email) {
      return res.status(400).json({ mensagem: 'O campo email é obrigatório.' });
    }

    if (!senha) {
      return res.status(400).json({ mensagem: 'O campo senha é obrigatório.' });
    }

    const emailExiste = await pool.query(
      'select count(*) from usuarios where email = $1;',
      [email]
    );

    if (parseInt(emailExiste.rows[0].count) !== 0) {
      return res
        .status(400)
        .json({
          mensagem:
            'O e-mail informado já está sendo utilizado por outro usuário.',
        });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await pool.query(
      'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning id, nome, email;',
      [nome, email, senhaCriptografada]
    );

    return res.status(201).json(novoUsuario.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: 'erro interno no servidor' });
  }
};

usuariosController.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ mensagem: 'O campo email é obrigatório.' });
    }

    if (!senha) {
      return res.status(400).json({ mensagem: 'O campo senha é obrigatório.' });
    }

    const { rows, rowCount } = await pool.query(
      'select * from usuarios where email = $1;',
      [email]
    );

    if (rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: 'Usuário e/ou senha inválido(s).' });
    }

    const { senha: senhaUsuario, ...usuario } = rows[0];

    const senhaValida = await bcrypt.compare(senha, senhaUsuario);

    if (!senhaValida) {
      return res
        .status(400)
        .json({ mensagem: 'Usuário e/ou senha inválido(s).' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_PASSWORD, {
      expiresIn: '8h',
    });

    return res.status(200).json({
      usuario,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: 'erro interno no servidor' });
  }
};

usuariosController.detalhar = async (req, res) => {
  const usuario = req.usuario;

  return res.status(200).json(usuario);
};

usuariosController.atualizar = async (req, res) => {
  const { nome, email, senha } = req.body;
  const usuario = req.usuario;

  try {
    if (!nome) {
      return res.status(400).json({ mensagem: 'O campo nome é obrigatório.' });
    }

    if (!email) {
      return res.status(400).json({ mensagem: 'O campo email é obrigatório.' });
    }

    if (!senha) {
      return res.status(400).json({ mensagem: 'O campo senha é obrigatório.' });
    }

    const emailExiste = await pool.query(
      'select count(*) from usuarios where email = $1;',
      [email]
    );

    if (parseInt(emailExiste.rows[0].count) !== 0) {
      return res
        .status(400)
        .json({
          mensagem:
            'O e-mail informado já está sendo utilizado por outro usuário.',
        });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await pool.query(
      `update usuarios
    set nome = $1,
    email = $2,
    senha = $3
    where id = $4;`,
      [nome, email, senhaCriptografada, usuario.id]
    );

    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mensagem: 'erro interno no servidor' });
  }
};

module.exports = usuariosController;
