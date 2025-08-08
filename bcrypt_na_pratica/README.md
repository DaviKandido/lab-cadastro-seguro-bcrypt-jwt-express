# Guia de Desenvolvimento — Entendendo o bcrypt 

### O que é o bcrypt e como será utilizado?

 O bcrypt é uma biblioteca para gerar hashes seguros de senhas, tornando-as ilegíveis no banco de dados.No entanto primeiramente entender o conceito de hash, que nada mais é que um processo unidirecional que transforma uma senha em uma sequência única e irreversível. Mesmo que o banco seja invadido, não será possível obter a senha original a partir do hash. O bcrypt aplica o salt, que adiciona aleatoriedade ao hash, dificultando ataques como rainbow tables.

Utilizaremos:
```js
 bcrypt.hash() → Para criar o hash antes de salvar no banco
 bcrypt.compare() → Para verificar se a senha informada pelo usuário corresponde ao hash armazenado
```

# Entendendo o projeto:

### Instalação de dependências:


```js
 npm install bcryptjs
```
> Use `bcryptjs` por compatibilidade; `bcrypt` (C++) também funciona mas pode exigir build tools.