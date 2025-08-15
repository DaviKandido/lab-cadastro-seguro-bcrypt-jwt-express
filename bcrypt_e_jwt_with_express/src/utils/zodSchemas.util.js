import z from "zod";

// Email validation regex pattern
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// At least one digit, one lowercase letter, one uppercase letter, and at least 6 characters
// Em Portuguese:
// "Ter pelo menos um digito, uma letra minuscula, uma letra maiúscula e pelo menos 6 caracteres"
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

// Base user schema
const baseUserSchema = z.object({
  name: z.string({
    error: (issue) => {
      issue.input === undefined ? "Campo obrigatório" : "Valor não é um string";
    },
  }),
  email: z
    .string({
      error: (issue) => {
        issue.input === undefined
          ? "Campo obrigatório"
          : "Valor não é um string";
      },
    })
    .regex(emailRegex, { message: "Invalid email format" })
    .toLowerCase(),
  password: z
    .string({
      error: (issue) => {
        issue.input === undefined
          ? "Campo obrigatório"
          : "Valor não é um string";
      },
    })
    .regex(passwordRegex, { message: "Invalid password format" }),
});

// Pick only the name, email and password fields
export const signUpSchema = baseUserSchema.omit({ password: true });

// Pick only the email and password fields
export const loginSchema = baseUserSchema.pick({
  email: true,
  password: true,
});
