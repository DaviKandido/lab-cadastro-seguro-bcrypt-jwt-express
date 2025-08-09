const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "minhaChaveSecreta"; // O ideial é armazenar essa chave em variáveis de ambiente

//Usuários de exemplo contendo apenas login e senha
const users = [
  { login: "user1@gmail.com", senha: "123" },
  { login: "user2@gmail.com", senha: "456" },
  { login: "user3@gmail.com", senha: "678" },
];

// Função para gerar o hash
async function hashSenha(senha) {
  // A função do salt gera um hash mais seguro, quanto maior o salt, mais seguro.
  // No entanto salts maiores exigem mais processamento.
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
}

async function verificarSenha(senha, hash) {
  // Verifica se a senha informada pelo usuário corresponde ao hash armazenado
  return await bcrypt.compare(senha, hash);
}

async function cadastroUsuario(login, senha) {
  const user = users.find((user) => user.login === login);
  if (user && user.login === login) {
    throw new Error("Usuário ja cadastrado");
  }

  // Adiciona o novo usuário ao array
  users.push({ login, senha: await hashSenha(senha) });
}

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
