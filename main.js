document.documentElement.classList.add("js");

// Elementos aparecem ao entrar na tela
const surgem = document.querySelectorAll(".abertura h1, .agora, .ficha, .faixa, .texto, .grande, .sobre-colunas, .marcos li");
surgem.forEach((el) => el.classList.add("surge"));
const olho = new IntersectionObserver((entradas) => {
  for (const e of entradas) {
    if (e.isIntersecting) {
      e.target.classList.add("visto");
      olho.unobserve(e.target);
    }
  }
}, { rootMargin: "0px 0px -10% 0px" });
surgem.forEach((el) => olho.observe(el));

// Ilustração do grafo: comunidades de empresas, cada uma em volta de um centro
const svg = document.getElementById("grafo");
if (svg) {
  let semente = 7;
  const acaso = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
  const centros = [[118, 118, 14], [292, 100, 9], [298, 268, 16], [122, 292, 11], [212, 196, 5]];
  const ns = "http://www.w3.org/2000/svg";
  const nos = [];
  centros.forEach(([cx, cy, n], g) => {
    for (let i = 0; i < n; i++) {
      const a = acaso() * Math.PI * 2, d = 8 + Math.sqrt(acaso()) * 58;
      nos.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, g });
    }
  });
  // Dentro do grupo: cada empresa ligada às 3 mais próximas. Entre grupos: poucas ligações fracas.
  const arestas = [];
  const visto = new Set();
  nos.forEach((a, i) => {
    const perto = nos
      .map((b, j) => [j, Math.hypot(a.x - b.x, a.y - b.y)])
      .filter(([j]) => j !== i && nos[j].g === a.g)
      .sort((p, q) => p[1] - q[1])
      .slice(0, 3);
    for (const [j] of perto) {
      const k = Math.min(i, j) + "-" + Math.max(i, j);
      if (!visto.has(k)) { visto.add(k); arestas.push([a, nos[j], 1]); }
    }
  });
  for (let g = 0; g < centros.length; g++) {
    for (let h = g + 1; h < centros.length; h++) {
      let melhor = null;
      for (const a of nos) if (a.g === g) for (const b of nos) if (b.g === h) {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (!melhor || d < melhor[2]) melhor = [a, b, d];
      }
      if (melhor[2] < 120) arestas.push([melhor[0], melhor[1], 0]);
    }
  }
  for (const [a, b, forte] of arestas) {
    const l = document.createElementNS(ns, "line");
    l.setAttribute("x1", a.x); l.setAttribute("y1", a.y);
    l.setAttribute("x2", b.x); l.setAttribute("y2", b.y);
    l.setAttribute("stroke", forte ? "#111" : "#9a948b");
    l.setAttribute("stroke-width", forte ? "1" : "0.7");
    if (!forte) l.setAttribute("stroke-dasharray", "3 3");
    svg.append(l);
  }
  const cores = ["#0a8f55", "#111", "#0a8f55", "#111", "#f2600c"];
  for (const n of nos) {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", n.x); c.setAttribute("cy", n.y);
    c.setAttribute("r", n.g === 4 ? 6 : 4.5);
    c.setAttribute("fill", cores[n.g]);
    svg.append(c);
  }
}
