import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

const app = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cadastro de Usuários",
      version: "1.0.0",
      license: {
        name: "MIT",
      },
      termsOfService: "http://localhost:3000/terms/",
      contact: {
        name: "Davi Cândido de Almeida",
        email: "davicandidopucminas@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Ambiente de desenvolvimento",
      },
      {
        url: "https://www.protected-api.com/v2",
        description: "Ambiente de produção",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsDoc(options);

app.use("/", swaggerUi.serve, swaggerUi.setup(specs));

export default app;
