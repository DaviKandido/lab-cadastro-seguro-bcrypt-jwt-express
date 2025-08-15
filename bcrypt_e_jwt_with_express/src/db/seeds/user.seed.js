export const seed = async (knex) => {
  // Deletes ALL existing entries
  await knex("users").del();

  // Inserts seed entries
  await knex("users").insert([
    {
      name: "Alice Souza",
      email: "alice@example.com",
      password: "hashed_password_1",
    },
    {
      name: "Bruno Lima",
      email: "bruno@example.com",
      password: "hashed_password_2",
    },
    {
      name: "Carla Mendes",
      email: "carla@example.com",
      password: "hashed_password_3",
    },
  ]);
};
