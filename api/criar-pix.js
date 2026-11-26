export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { valor, nome } = req.body;

  const r = await fetch(`${process.env.PIX_API_URL}/cobrancas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PIX_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ valor, nome })
  });

  const data = await r.json();
  res.status(r.status).json(data);
}