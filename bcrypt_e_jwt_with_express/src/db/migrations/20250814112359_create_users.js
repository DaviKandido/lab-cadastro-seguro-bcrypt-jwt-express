/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
 return await knex.schema.createTable('users', table => {
  table.increments('id').primary();
  table.string('name').notNullable();
  table.string('email').unique().notNullable();
  table.string('password').notNullable();
 })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const  down = async function (knex) {
  return await knex.schema.dropTable("users");
};
