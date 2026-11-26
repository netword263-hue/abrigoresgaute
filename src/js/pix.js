const btn = document.getElementById("btn-pix");
const out = document.getElementById("resultado");

btn?.addEventListener("click", async () => {
  btn.disabled = true;
  out.textContent = "Gerando Pix...";

  try {
    const res = await fetch("/api/criar-pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valor: Number(document.getElementById("valor").value),
        nome: document.getElementById("nome").value
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro");

    out.textContent = "";
    const qr = document.createElement("div");
    out.appendChild(qr);
    new QRCode(qr, { text: data.qrcode, width: 220, height: 220 });

    const code = document.createElement("textarea");
    code.readOnly = true;
    code.value = data.qrcode;
    code.rows = 4;
    code.style.width = "100%";
    out.appendChild(code);

    const copy = document.createElement("button");
    copy.textContent = "Copiar código Pix";
    copy.onclick = () => navigator.clipboard.writeText(data.qrcode);
    out.appendChild(copy);
  } catch (e) {
    out.textContent = e.message;
  } finally {
    btn.disabled = false;
  }
});
