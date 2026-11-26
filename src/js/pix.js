document.getElementById("btn-pix")?.addEventListener("click", async () => {
  const res = await fetch("/api/criar-pix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor: 10.0, nome: "Cliente" })
  });
  const data = await res.json();
  document.getElementById("resultado").textContent = JSON.stringify(data);
});