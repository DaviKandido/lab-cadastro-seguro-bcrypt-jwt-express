# 📖 Guia de Desenvolvimento — Entendendo o bcrypt

### 🔍 O que é o bcrypt e como será utilizado?

O bcrypt é uma biblioteca para gerar hashes seguros de senhas, tornando-as ilegíveis no banco de dados. No entanto primeiramente precisamos entender o conceito de hash, que nada mais é que um processo unidirecional que transforma uma senha em uma sequência única e irreversível. Mesmo que o banco seja invadido, não será possível obter a senha original a partir do hash. E para complementar isso o bcrypt aplica o salt, que adiciona aleatoriedade ao hash, dificultando ataques como rainbow tables.

Utilizaremos:
```js
 bcrypt.hash() → Para criar o hash antes de salvar no banco
 bcrypt.genSalt() → Para gerar um hash mais seguro
 bcrypt.compare() → Para verificar se a senha informada pelo usuário corresponde ao hash armazenado
```

# Entendendo o projeto:

### ⚙️ Instalação de dependências

```sh
 npm install bcryptjs
```


> Use `bcryptjs` por compatibilidade; `bcrypt` (C++) também funciona mas pode exigir build tools.

### 🚀 Iniciando o projeto

Iniciaremos definido a função responsável por fazer o hash da senha do usuário e em seguida a função que verificará se a senha informada corresponde ao do hash

```js
const bcrypt = require("bcryptjs");

// Função para gerar o hash
async function hashSenha(senha) {
  // A função do salt gera um hash mais seguro, quanto maior o salt, mais seguro.
  // No entanto salts maiores exigem mais processamento.
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
}
```

```js
async function verificarSenha(senha, hash) {
  // Verifica se a senha informada pelo usuário corresponde ao hash armazenado
  return await bcrypt.compare(senha, hash);
}
```

### 🗄️ Simulação de base de dados em array

A fim de simular uma base de dados criaremos um array de usuário

```js
//Usuários de exemplo contendo apenas login e senha
const users = [
  { login: "user1@gmail.com", senha: "123" },
  { login: "user2@gmail.com", senha: "456" },
  { login: "user3@gmail.com", senha: "678" },
];
```

### 🔑 Funções de cadastro e login

Agora criaremos uma função de cadastro e login que simule tais operações

```js
async function cadastroUsuario(login, senha) {
  const user = users.find((user) => user.login === login);
  if (user && user.login === login) {
    throw new Error("Usuário ja cadastrado");
  }

  // Adiciona o novo usuário ao array
  users.push({ login, senha: await hashSenha(senha) });
}
```

```js
async function loginUsuario(login, senha) {
  const user = users.find((user) => user.login === login);
  if (!user) {
    throw new Error("Usuário inexistente");
  }

  const ok = await verificarSenha(senha, user.senha);
  if (!ok) {
    throw new Error("Senha incorreta");
  }

  return "Login efetuado com sucesso";
}
```

### 🔄 Fluxo do usuário

E por fim, uma função que tem como finalidade simular fluxos comuns de um usuário, realizando operações de cadastro e login, informando um cadastro anteriormente realizado e um teste de login incorreto

```js
async function fluxoUsuario() {
  try {
    // Cadastro
    await cadastroUsuario("user4@gmail.com", "123456");

    // Login correto
    const loginCerto = await loginUsuario("user4@gmail.com", "123456");
    console.log("Retorno: ", loginCerto);

    // Exemplo de login com usuário inexistente (descomente para testar)
    //const loginErrado = await loginUsuario("userInexistente@gmail.com", "876543");

    // Listar usuários cadastrados
    users.forEach((user, i) => console.log(`user${i}: `, user));

  } catch (err) {
    console.log("Erro:", err.message);
  }
}

fluxoUsuario();
```

### 📌 Conclusão

- Nunca armazene senhas em texto puro no banco de dados.
- Sempre utilize hashing com salt para aumentar a segurança.
- O bcrypt é amplamente usado no mercado e considerado seguro para a maioria das aplicações.

### 🚀 Próximos Passos — Integrando com JWT para autenticação

* [Veja como integrar a esse projeto autentificação com JWT](../jwt_na_pratica/)