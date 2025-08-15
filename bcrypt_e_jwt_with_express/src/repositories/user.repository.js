import db from "../db/db.js";

const userRepository = {
  findAllUsers: async () => {
    return await db("users");
  },

  findUserByEmail: async (email) => {
    return await db("users").where("email", email).first();
  },

  findUserById: async (id) => {
    return await db("users").where({ id: id }).first();
  },

  insertUser: async (user) => {
    return await db("users").insert(user).returning("*");
  },

  updateUser: async (id, user) => {
    return await db("users").where("id", id).update(user).returning("*");
  },

  deleteUser: async (id) => {
    return await db("users").where("id", id).del();
  },
};

export default userRepository;
