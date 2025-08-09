# 📖 Guia de Desenvolvimento — Integrando com JWT para autenticação

### 🔍 O que é JWT e como será utilizado?

Agora que já sabemos como cadastrar e validar usuários com bcrypt, podemos avançar para autenticação por token utilizando JWT (JSON Web Token). Isso permitirá que, após o login, o usuário receba um token para acessar rotas protegidas sem precisar enviar login e senha a cada requisição.

Mas antes precisamos entender que o JWT (JSON Web Token) é um padrão para autenticação e troca segura de informações entre cliente e servido. Sendo composto por três partes:

- Header (tipo do token e algoritmo usado)
- Payload (informações do usuário, como id ou email)
- Signature (garante que o token não foi alterado)

Utilizaremos:

```js
 jwt.sign() → para gerar o token
 jwt.verify() → para validar o token recebido do cliente
 jwt.decoded() → para retornar o payload
```

# Entendendo o projeto:

### ⚙️ Instalação de dependências

```js
 npm install bcryptjs

 npm install jsonwebtoken
```

> Use `bcryptjs` por compatibilidade; `bcrypt` (C++) também funciona mas pode exigir build tools.

### 🚀 Iniciando o projeto

Antes de iniciamos é preciso entender que esse projeto é uma continuação direta do guia "Guia de Desenvolvimento — Entendendo o bcrypt", caso não o tenha visto antes volte e veja os seus conceitos antes de continua.

- [Guia de Desenvolvimento — Entendendo o bcrypt](../bcrypt_na_pratica/)

A primeira modificação que iremos fazer é incluir a geração do token de acesso após o usuário realizar um login com sucesso, ou seja nossa função de login agora também retornará um token, veja:

```js
const jwt = require("jsonwebtoken");
const SECRET = "minhaChaveSecreta"; // Armazene isso em variáveis de ambiente

async function loginUsuario(login, senha) {
  const user = users.find((user) => user.login === login);
  if (!user) {
    throw new Error("Usuário inexistente");
  }

  const ok = await verificarSenha(senha, user.senha);
  if (!ok) {
    throw new Error("Senha incorreta");
  }

  // Gerar token com ID ou login do usuário
  const token = jwt.sign({ login: user.login }, SECRET, { expiresIn: "1h" });

  return { message: "Login efetuado com sucesso", token: token };
}
```

Veja que agora um login realizado com sucesso retornara algo parecido com isso:

```json
{
  "message": "Login efetuado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6InVzZXI0QGdtYWlsLmNvbSIsImlhdCI6MTc1NDcwMjk5NiwiZXhwIjoxNzU0NzA2NTk2fQ.9J2ZH2WZ6ZKE7R8yDzlwvSKH_NmZNCy8ZX80QmKW9gY"
}
```

### 🔐 Validação do token gerado

Agora criaremos uma função que servira para validar o token gerado, veja que utilizamos jwt.verify() para realizar essa validação, e observe que ao realizarmos um decode - jwt.decode(token), podemos retornar o payload ou seja, o conteúdo utilizado para realizar a geração do token.

```js
function validarJwt(token) {
  const verificar = jwt.verify(token, SECRET);

  // O jwt.decodem nada mais faz do que decodificar o token devolvendo o payload
  // const payload = jwt.decode(token);
  // console.log("Payload: ", payload.login);

  if (!verificar) {
    throw new Error("Token inválido");
  }
  return true;
}
```

### 🔄 Fluxo do usuário com validação de token

E por fim, acrescentemos a logica de validação do token gerado a função responsável pela simulação do fluxo de um usuário

```js
async function fluxoUsuario() {
  try {
    await cadastroUsuario("user4@gmail.com", "123456");

    const loginCerto = await loginUsuario("user4@gmail.com", "123456");
    console.log("Retorno: ", loginCerto);

    // Validando o token de acesso
    const token = loginCerto.token;
    const ok = validarJwt(token);
    console.log("Token Valido: ", ok);

    // Exemplo de login com usuário inexistente
    //const loginErrado = await loginUsuario("userInexistente@gmail.com", "876543");

    //users.forEach((user, i) => console.log(`user${i}: `, user));
  } catch (err) {
    console.log("Erro:", err.message);
  }
}

fluxoUsuario();
```

### 📌 Conclusão

- Nunca armazene senhas em texto puro no banco de dados — sempre utilize hashing com salt para aumentar a segurança.
- O bcrypt é amplamente utilizado no mercado e oferece um nível de proteção adequado para a maioria das aplicações.
- O JWT permite autenticar usuários de forma prática e segura, evitando o envio repetido de login e senha a cada requisição.
- Com a combinação de bcryptjs para proteção das credenciais e JWT para autenticação baseada em tokens, você estabelece uma base sólida para proteger o back-end da sua aplicação.

### 🚀 Próximos Passos — Integrando Bcryptjs e JWT a um projeto express

Veja como integrar esses mecanismos de segurança a um projeto express real com rotas de cadastro e autentificação de usuário, através de middlewares para proteção das rotas, respostas adequadas para erros de autenticação, integração com Postman ou Insomnia para testes e muito mais...

- [Veja como integrar esses mecanismos de segurança](../bcrypt_e_jwt_with_express/)
