import dotenv from "dotenv";
dotenv.config();


/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {
  development: {
    client: "pg",
    connection: {
      host: "127.0.0.1",
      port: 5435,
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      database: process.env.POSTGRES_DB || "cadastro_db",
    },
    migrations: {
      directory: "src/db/migrations",
      extension: "js",
    },
    seeds: {
      directory: "src/db/seeds",
    },
  },
  ci: {
    client: "pg",
    connection: {
      host: "postgres",
      port: 5435,
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      database: process.env.POSTGRES_DB || "cadastro_db",
    },
    migrations: {
      directory: "src/db/migrations",
      extension: "js",
    },
    seeds: {
      directory: "src/db/seeds",
    },
  },
};

export default config;