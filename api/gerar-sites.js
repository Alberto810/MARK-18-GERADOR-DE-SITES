import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GROQ_API_KEY;

function limparCodigo(texto) {
    return texto
        .replace(/```html/g, "")
        .replace(/```/g, "")
        .trim();
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido." });
    }

    const { input } = req.body;

    if (!input) {
        return res.status(400).json({ error: "O campo 'input' é obrigatório." });
    }

    if (!API_KEY) {
        return res.status(500).json({ error: "Chave de API não configurada." });
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
                        content: `Você é um gerador de sites profissonais.

Regras:
1. Gere apenas código HTML, CSS e JavaScript.
2. Não inclua explicações ou comentários.
3. Use as melhores práticas de desenvolvimento web.
4. O código deve ser responsivo e compatível com dispositivos móveis.
5. Seja criativo, mas mantenha a funcionalidade e a usabilidade em mente.
6. Analise a descrição do que foi pedido e certifique-se de seguir as instruções corretamente.
7. Ao final de cada geração, certifique-se de gerar sempre algo novo e diferente, mesmo que a descrição seja semelhante a uma anterior.
8. Receba uma descrição do site a ser criado.
9. Gere o código HTML, CSS e JavaScript necessário para criar o site.
10. Retorne o código gerado sem formatação adicional.
11. Certifique-se de que o código esteja limpo e funcional para que possa ser usado para produção.
12. Certifique-se se foi gerado um código completo que funcione corretamente e se foi seguido a risca o que foi pedido.
13. Se a descrição for vaga, use sua criatividade para preencher as lacunas, mas mantenha a relevância com o que foi pedido.

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

        return res.json({ codigo, bruto });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
}