![Sistema Dindin](/images/dindin.png)

<p align="center"><b>Projeto API Sistema Dindin - Node.js</b></p>

## Sobre

Este projeto visa exercitar e avaliar alguns conceitos de Back-end estudados ao longo do módulo 3, do curso de desenvolvimento de software, com foco em Back-end, da Cubos academy. Sendo alguns desses conceitos:
- API Rest
- Programação assíncrona
- Function Async/await
- CRUD
- JSON
- Banco de dados relacional (PostgreSQL)
- Persistência de dados
- Dotenv
- Criptografia de dados
- Framework Express.js
- Fluxo de trabalho em equipe com Git e GitHub
- Criação e validação de token com JWT

## Features
- Rota ```POST``` para cadastro de usuário
- Rota ```POST``` para login de usuário e criação do token de autenticação (JWT)
- Intermediário de validação de token para verificar se o usuário está logado
- Rota ```GET``` para detalhar usuário logado através do token
- Rota ```PUT``` para atualizar usuário logado através do ID do token
- Rota ```GET``` para listar categorias com usuário logado
- Rota ```GET``` para listar transações referentes ao usuário logado
- Rota ```GET``` para obter extrato bancário referente ao usuário logado
- Rota ```GET``` para detalhar transação pelo ID referente ao usuário logado
- Rota ```POST``` para cadastrar nova transação referente ao usuário logado
- Rota ```PUT``` para atualizar transação pelo ID referente ao usuário logado
- Rota ```DELETE``` para remover transação pelo ID referente ao usuário logado
- Banco de dados relacional utilizando PostgreSQL

## Tecnologias
- Javascript
- Node.js
- Express.js
- PostgreSQL

## Requisitos
- NPM instalado na sua máquina
- Node instalado na sua máquina
- PostgreSQL instalado na sua máquina
- Editor de código instalado na sua máquina (recomendação: **_Visual Studio Code_**)

## Como instalar
- Clone este repositório em qualquer pasta que desejar
- Abra o seu terminal na mesma página criada e digite:
```
npm install
```

Após esperar um tempo, todas as dependências para rodar este server estarão instaladas
- Agora você só precisa iniciar um server de desenvolvimento escrevendo
```
npm run dev
```
**Lembre-se, este projeto utiliza o PostgreSQL como banco de dados e necessita da criação do banco de dados através do Script do arquivo scriptBD.sql.**

## Rotas
- ```[POST]``` /usuario
- ```[POST]``` /login
- ```[GET]``` /usuario
- ```[PUT]``` /usuario
- ```[GET]``` /categoria
- ```[GET]``` /transacao
- ```[GET]``` /transacao/extrato
- ```[GET]``` /transacao/:id
- ```[POST]``` /transacao
- ```[PUT]``` /transacao/:id
- ```[DELETE]``` /transacao/:id
  
![Rotas](/images/rotas.png)

## Rotas Controllers
- ```[POST]``` /usuario
 ```javascript
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
```

- ```[POST]``` /login
```javascript
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
```

- ```[GET]``` /usuario
```javascript
usuariosController.detalhar = async (req, res) => {
  const usuario = req.usuario;

  return res.status(200).json(usuario);
};
```

- ```[PUT]``` /usuario
```javascript
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
```

- ```[GET]``` /categoria
```javascript
categoriasController.listar = async (req, res) => {

    try {
        const listaCategorias = await pool.query('select * from categorias');

        return res.status(200).json(listaCategorias.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}
```

- ```[GET]``` /transacao
```javascript
transacoesController.listar = async (req, res) => {
    const usuario = req.usuario;

    try {
        const listaTransacoes = await pool.query(`select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome
        from transacoes t
        join categorias c
        on t.categoria_id = c.id
        where t.usuario_id = $1
        order by id asc;`, [usuario.id]);

        return res.status(200).json(listaTransacoes.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}
```

- ```[GET]``` /transacao/extrato
```javascript
transacoesController.obterExtrato = async (req, res) => {
    const usuario = req.usuario;

    try {
        const { rows } = await pool.query(`select sum(valor)
        from transacoes
        where usuario_id = $1
        group by tipo;`, [usuario.id]);

        let entrada = 0;
        let saida = 0;

        if (rows[0]) {
            entrada += parseInt(rows[0].sum);
        }

        if (rows[1]) {
            saida += parseInt(rows[1].sum);
        }

        const extrato = {
            entrada,
            saida
        }

        res.status(200).json(extrato);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}
```

- ```[GET]``` /transacao/:id
```javascript
transacoesController.detalhar = async (req, res) => {
    const usuario = req.usuario;
    const { id } = req.params;

    try {
        const detalhesTransacao = await pool.query(`select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome
        from transacoes t
        join categorias c
        on t.categoria_id = c.id
        where t.usuario_id = $1
        and t.id = $2;`, [usuario.id, parseInt(id)]);

        if (detalhesTransacao.rowCount === 0) {
            return res.status(404).json({ mensagem: "Transação não encontrada." });
        }

        return res.status(200).json(detalhesTransacao.rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}
```

- ```[POST]``` /transacao
```javascript
transacoesController.cadastrar = async (req, res) => {
    const usuario = req.usuario;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
        }

        if (tipo !== "entrada" && tipo !== "saida") {
            return res.status(400).json({ mensagem: 'O tipo de transação necessita ser entrada ou saida.' });
        }

        const categoriaExiste = await funcoes.categoriaExiste(categoria_id);

        if (categoriaExiste === 0) {
            return res.status(400).json({ mensagem: 'A categoria informada não existe.' });
        }

        const { rows } = await pool.query(`insert into transacoes
        (descricao, valor, data, tipo, categoria_id, usuario_id)
        values ($1, $2, $3, $4, $5, $6)
        returning id;`, [descricao, valor, data, tipo, categoria_id, usuario.id]);

        const novaTransacao = await pool.query(`select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome
        from transacoes t
        join categorias c
        on t.categoria_id = c.id
        where t.id = $1;`, [rows[0].id]);

        return res.status(201).json(novaTransacao.rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}
```

- ```[PUT]``` /transacao/:id
```javascript
transacoesController.atualizar = async (req, res) => {
    const usuario = req.usuario;
    const { id } = req.params;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
        }

        if (tipo !== "entrada" && tipo !== "saida") {
            return res.status(400).json({ mensagem: 'O tipo de transação necessita ser entrada ou saida.' });
        }

        const categoriaExiste = await funcoes.categoriaExiste(categoria_id);

        if (categoriaExiste === 0) {
            return res.status(400).json({ mensagem: 'A categoria informada não existe.' });
        }

        const transacaoExiste = await pool.query(
            `select *
            from transacoes
            where id = $1
            and usuario_id = $2;`, [parseInt(id), usuario.id]);

        if (transacaoExiste.rowCount === 0) {
            return res.status(400).json({ mensagem: 'A transação informada não existe.' });
        }

        await pool.query(`update transacoes
        set descricao = $1,
        valor = $2,
        data = $3,
        categoria_id = $4,
        tipo = $5
        where id = $6
        and usuario_id = $7;`, [descricao, valor, data, categoria_id, tipo, parseInt(id), usuario.id]);

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}
```

- ```[DELETE]``` /transacao/:id
```javascript
transacoesController.remover = async (req, res) => {
    const usuario = req.usuario;
    const { id } = req.params;

    try {
        const transacaoExiste = await pool.query(`select *
        from transacoes
        where id = $1
        and usuario_id = $2;`, [parseInt(id), usuario.id]);

        if (transacaoExiste.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada.' });
        }

        await pool.query(`delete
        from transacoes
        where id = $1
        and usuario_id = $2;`, [parseInt(id), usuario.id]);

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'erro interno no servidor' });
    }
}
```