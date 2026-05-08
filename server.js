const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GROQ_API_KEY;

app.use(express.static(path.join(__dirname)));
app.use(cors());
app.use(express.json());

function limparCodigo(texto) {
    return texto
        .replace(/```html/g, "")
        .replace(/```/g, "")
        .trim();
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/api/gerar-sites", async (req, res) => {
    const { input } = req.body;

    if (!input) {
        return res.status(400).json({ error: "O campo 'input' é obrigatório." });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: "Chave de API não configurada no servidor." });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        content: `
                        Você é um gerador de sites.

Regras:
1. Gere apenas código HTML, CSS e JavaScript.
2. Não inclua explicações ou comentários.
3. O código deve ser limpo e funcional.
4. Use as melhores práticas de desenvolvimento web.
5. O código deve ser responsivo e compatível com dispositivos móveis.
Instruções:
1. Receba uma descrição do site a ser criado.
2. Gere o código HTML, CSS e JavaScript necessário para criar o site.
3. Retorne o código gerado sem formatação adicional.
                        `.trim(),
                    },
                    {
                        role: "user",
                        content: input,
                    },
                ],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data });
        }

        const bruto = data.choices?.[0]?.message?.content || "";
        const codigo = limparCodigo(bruto);

        return res.json({
            codigo,
            bruto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

// Para rodar localmente
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

// Necessário para a Vercel
module.exports = app;


