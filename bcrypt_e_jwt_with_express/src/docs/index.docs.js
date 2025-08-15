import fs from "fs";
import path from "path";
import { marked } from "marked";
import { fileURLToPath } from "url";
import express from "express";
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", (req, res) => {
  const readmePath = path.join(__dirname, "../../README.md");

  fs.readFile(readmePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Erro ao ler README.md");
    }

    const htmlContent = marked(data);

    const fullPage = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>README</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: auto; 
            padding: 20px; 
            line-height: 1.6; 
          }
          pre { background: #f4f4f4; padding: 10px; border-radius: 4px; }
          code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
          h1, h2, h3 { border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          a { color: #0366d6; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    res.type("html").send(fullPage);
  });
});

export default router;