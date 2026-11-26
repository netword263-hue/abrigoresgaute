/* ===== Carrosséis ===== */

document.querySelectorAll("[data-carousel]").forEach((root) => {
  const track = root.querySelector(".track");
  const slides = [...track.children];
  const nav = root.querySelector(".nav");
  const dotsBox = root.querySelector(".dots");

  if (slides.length < 2) {
    nav.hidden = true;
    return;
  }

  let atual = 0;

  const dots = slides.map((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "dot";
    d.setAttribute("aria-label", "Ir para o slide " + (i + 1));
    d.addEventListener("click", () => ir(i));
    dotsBox.appendChild(d);
    return d;
  });

  const marcar = () => dots.forEach((d, i) =>
    d.classList.toggle("on", i === atual)
  );

  function ir(i) {
    atual = (i + slides.length) % slides.length;

    track.scrollTo({
      left: atual * track.clientWidth,
      behavior: "smooth"
    });

    marcar();
  }

  root.querySelector(".prev").addEventListener("click", () => ir(atual - 1));
  root.querySelector(".next").addEventListener("click", () => ir(atual + 1));

  track.addEventListener("scroll", () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);

    if (i !== atual) {
      atual = i;
      marcar();
    }
  }, { passive: true });

  marcar();
});


/* ===== Doação via Pix ===== */

const VALOR_MIN = 10;
const VALOR_MAX = 5000;

const valorInput = document.getElementById("valor");
const btn = document.getElementById("btn-pix");
const out = document.getElementById("resultado");

function mostrarErro(msg) {
  out.innerHTML = "";

  const erro = document.createElement("p");
  erro.className = "erro";
  erro.textContent = msg;

  out.appendChild(erro);
}

function marcarValor() {
  const v = Number(valorInput.value);

  document.querySelectorAll(".valores [data-valor]").forEach((b) => {
    b.classList.toggle("on", Number(b.dataset.valor) === v);
  });
}

document.querySelectorAll("[data-valor]").forEach((b) => {
  b.addEventListener("click", () => {
    valorInput.value = b.dataset.valor;
    marcarValor();

    if (!b.closest(".valores")) {
      document.getElementById("doar").scrollIntoView({
        behavior: "smooth"
      });
    }
  });
});

valorInput.addEventListener("input", marcarValor);

btn.addEventListener("click", async () => {
  const valor = Number(valorInput.value);

  if (
    !Number.isFinite(valor) ||
    valor < VALOR_MIN ||
    valor > VALOR_MAX
  ) {
    mostrarErro(
      "Informe um valor entre R$ 10,00 e R$ 5.000,00."
    );
    return;
  }

  btn.disabled = true;
  out.textContent = "Gerando Pix...";

  try {
    const res = await fetch("/api/criar-pix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ valor })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao gerar o Pix");
    }

    if (!data.qrcode) {
      throw new Error("A Nexpay não retornou o código Pix.");
    }

    out.textContent = "";

    const qrBox = document.createElement("div");
    qrBox.className = "qr";
    out.appendChild(qrBox);

    new QRCode(qrBox, {
      text: data.qrcode,
      width: 220,
      height: 220
    });

    const aviso = document.createElement("p");

    aviso.textContent =
      "Abra o app do seu banco, escolha Pix e leia o QR Code, ou use o código abaixo:";

    out.appendChild(aviso);

    const code = document.createElement("textarea");

    code.readOnly = true;
    code.rows = 4;
    code.value = data.qrcode;

    out.appendChild(code);

    const copiar = document.createElement("button");

    copiar.type = "button";
    copiar.className = "copiar";
    copiar.textContent = "Copiar código Pix";

    copiar.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(data.qrcode);
      } catch {
        code.select();
        document.execCommand("copy");
      }

      copiar.textContent = "Copiado! 💙";

      setTimeout(() => {
        copiar.textContent = "Copiar código Pix";
      }, 2000);
    });

    out.appendChild(copiar);

  } catch (e) {
    mostrarErro(e.message);

  } finally {
    btn.disabled = false;
  }
});