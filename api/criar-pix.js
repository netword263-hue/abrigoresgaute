import { randomUUID } from "node:crypto";

const BASE = "https://api.nexpaysolucoes.com";
const VALOR_MIN = 1;
const VALOR_MAX = 5000; // ajuste ao seu caso

let cache = { token: null, exp: 0 };

async function getToken() {
  if (cache.token && Date.now() < cache.exp) return cache.token;

  const basic = Buffer.from(
    `${process.env.NEXPAY_CLIENT_ID}:${process.env.NEXPAY_CLIENT_SECRET}`
  ).toString("base64");

  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json"
    }
  });
  if (!r.ok) throw new Error(`login falhou: ${r.status}`);

  const d = await r.json();
  cache = { token: d.access_token, exp: Date.now() + (d.expires_in - 60) * 1000 };
  return cache.token;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { valor, nome, email, telefone, documento } = req.body || {};

    const amount = Number(valor);
    if (!Number.isFinite(amount) || amount < VALOR_MIN || amount > VALOR_MAX) {
      return res.status(400).json({ error: "Valor inválido" });
    }

    const customer = {};
    if (nome) customer.name = String(nome).slice(0, 100);
    if (email) customer.email = String(email).slice(0, 100);
    if (telefone) customer.phone = String(telefone).replace(/\D/g, "");
    if (documento) customer.document = String(documento).replace(/\D/g, "");

    const token = await getToken();

    const r = await fetch(`${BASE}/api/pix/charge`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100) / 100,
        external_id: `DOACAO-${randomUUID()}`,
        description: "Doação Abrigo Resgaute",
        ...(Object.keys(customer).length ? { customer } : {})
      })
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      console.error("Nexpay charge erro", r.status, data);
      return res.status(502).json({ error: "Não foi possível gerar o Pix" });
    }

    return res.status(200).json({
      transactionId: data.transactionId,
      amount: data.amount,
      qrcode: data.qrcode,
      status: data.status
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro interno" });
  }
}