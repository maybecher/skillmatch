/* Lógica do jogo, em formato de stories. Os textos, perguntas e configurações ficam em dados.js. */

const KEYS = Object.keys(MODALIDADES);
const ITENS = Object.fromEntries([...PERGUNTAS, ...DUELOS.map(d => ({ ...d, duelo: true }))].map(p => [p.id, p]));
/* Identidade do Team 1.01: azul-marinho, azul vibrante, dourado e o vermelho das estrelas do símbolo. */
const CORES = ["#d4a017", "#f3c94d", "#2563eb", "#60a5fa", "#d7111a", "#ffffff"];
/* Cada tela usa um destes temas. "veu" é o degradê aplicado sobre a padronagem;
   "base" é a cor sólida equivalente, usada para misturar fundos de botões. */
const TEMAS = [
  { nome: "noite", veu: "linear-gradient(135deg, rgba(7,14,36,.95), rgba(37,99,235,.88))", base: "#0d1c4f", fg: "#ffffff", ac: "#f3c94d", acInk: "#070e24", cta: "ouro" },
  { nome: "ouro", veu: "linear-gradient(135deg, rgba(212,160,23,.96), rgba(243,201,77,.95))", base: "#e0b232", fg: "#070e24", ac: "#1d4fc4", acInk: "#ffffff", cta: "noite" },
  { nome: "azul", veu: "linear-gradient(160deg, rgba(37,99,235,.93), rgba(23,40,81,.96))", base: "#1e4bb8", fg: "#ffffff", ac: "#f3c94d", acInk: "#070e24", cta: "ouro" },
  { nome: "profundo", veu: "linear-gradient(180deg, rgba(16,28,64,.95), rgba(7,14,36,.98))", base: "#0c1633", fg: "#ffffff", ac: "#f3c94d", acInk: "#070e24", cta: "ouro" },
  { nome: "claro", veu: "linear-gradient(160deg, rgba(245,247,252,.96), rgba(219,230,252,.95))", base: "#eef2fb", fg: "#070e24", ac: "#2563eb", acInk: "#ffffff", cta: "azul" },
  { nome: "rubi", veu: "linear-gradient(135deg, rgba(7,14,36,.95), rgba(215,17,26,.82))", base: "#3a1230", fg: "#ffffff", ac: "#f3c94d", acInk: "#070e24", cta: "ouro" }
];
const MODO_TESTE = new URLSearchParams(location.search).has("teste");
const REG_KEY = "skillmatch:registros";
/* Quantas opções cada pergunta de múltipla escolha mostra, e quantos duelos entram por jogo. */
const OPCOES_POR_PERGUNTA = 8, DUELOS_POR_JOGO = 5; // 10 perguntas + 5 duelos = sempre 15 (o 5º vira desempate quando precisa)
const app = document.getElementById("app");
const reduzMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } }
};

let state = novoJogo();

function embaralhar(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function esc(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function novoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/* Monta as perguntas de um jogo. Há mais modalidades do que opções por pergunta, então cada pergunta
   mostra as modalidades que apareceram menos até ali (empates sorteados). Assim todas aparecem
   praticamente o mesmo número de vezes. Os duelos são sorteados do banco pelo mesmo critério.
   As perguntas ficam na ordem do arquivo; os duelos entram espalhados entre elas. */
function montarItens() {
  const vezes = Object.fromEntries(KEYS.map(k => [k, 0]));
  const menosVistas = (ks, n) => embaralhar(ks).sort((a, b) => vezes[a] - vezes[b]).slice(0, n);
  const marcar = ks => ks.forEach(k => vezes[k]++);

  const banco = embaralhar(DUELOS), duelos = [];
  while (duelos.length < Math.min(DUELOS_POR_JOGO, banco.length)) {
    const peso = d => Object.keys(d.o).reduce((s, k) => s + vezes[k], 0);
    banco.sort((a, b) => peso(a) - peso(b));
    const d = banco.shift();
    duelos.push(d); marcar(Object.keys(d.o));
  }
  const multipla = PERGUNTAS.map(p => {
    const ks = menosVistas(Object.keys(p.o), OPCOES_POR_PERGUNTA);
    marcar(ks);
    return { id: p.id, ordem: embaralhar(ks) };
  });

  // Duelos espalhados ao longo do jogo (com 10 perguntas: depois da 2ª, 4ª, 6ª e 8ª).
  // O último duelo fica reservado para a 15ª pergunta, que vira o desempate quando há empate (ver escolher()).
  const comoItem = d => ({ id: d.id, ordem: embaralhar(Object.keys(d.o)) });
  const final = duelos.pop();
  const seq = [], passo = Math.max(1, Math.floor(multipla.length / (duelos.length + 1)));
  multipla.forEach((it, j) => { seq.push(it); if ((j + 1) % passo === 0 && j < multipla.length - 1 && duelos.length) seq.push(comoItem(duelos.shift())); });
  duelos.forEach(d => seq.push(comoItem(d)));
  if (final) seq.push({ ...comoItem(final), final: true });
  return seq;
}

function novoJogo(tela = "inicio", perfil = {}) {
  return { tela, nome: perfil.nome || "", nasc: perfil.nasc || null, expectativa: perfil.expectativa || "",
    i: 0, respostas: [], tempos: [], itens: montarItens(), sorteio: embaralhar(KEYS), desempate: null, desempateOrdem: null,
    pausaVista: false, slide: 0, id: novoId(), registrado: false, feedback: null };
}

/* Afinidade bruta = das vezes em que a modalidade apareceu numa pergunta de múltipla escolha, quantas o aluno
   escolheu, com o ajuste dos duelos.
   Contar as oportunidades evita que uma modalidade ganhe só por ter aparecido mais.
   É ela que decide o 1º lugar e o desempate. */
function calcularBruto(comDesempate = true) {
  const pts = Object.fromEntries(KEYS.map(k => [k, 0])), vezes = { ...pts }, saldo = { ...pts };
  // Duelos e desempate não entram na proporção (num duelo a chance de ser escolhida é 50%, contra 12,5% numa
  // pergunta de 8 opções, o que favoreceria quem aparece em mais duelos). Eles ajustam: +½ ponto para quem vence, −½ para quem perde.
  const duelo = (ks, venc) => ks.forEach(k => { if (k in saldo) saldo[k] += k === venc ? 0.5 : -0.5; });
  state.itens.forEach((it, j) => {
    const resp = state.respostas[j];
    if (!resp) return;
    if (ITENS[it.id].duelo) return duelo(it.ordem, resp);
    it.ordem.forEach(k => { if (k in vezes) vezes[k]++; });
    if (resp in pts) pts[resp]++;
  });
  const d = comDesempate ? state.desempate : null;
  if (d in pts && state.desempateOrdem) duelo(state.desempateOrdem, d);
  const r = KEYS.map(k => ({ k, pts: pts[k], vezes: vezes[k], taxa: vezes[k] ? Math.min(1, Math.max(0, (pts[k] + saldo[k]) / vezes[k])) : 0 }))
    .map(x => ({ ...x, pct: Math.round(100 * x.taxa) }))
    // Empate exato: vale a ordem sorteada no início do jogo, para nenhuma modalidade levar vantagem pela posição na lista.
    .sort((a, b) => b.taxa - a.taxa || b.pts - a.pts || state.sorteio.indexOf(a.k) - state.sorteio.indexOf(b.k));
  // A escolha do desempate decide quem fica em 1º entre as duas que empataram.
  if (d && r[1]?.k === d && state.desempateOrdem?.includes(r[0].k)) [r[0], r[1]] = [r[1], r[0]];
  return r;
}

/* Relação lógica entre duas modalidades, pelos GRUPOS e LIGACOES de dados.js. */
function relacao(a, b) {
  if (a === b || Object.values(GRUPOS).some(g => g.includes(a) && g.includes(b))) return PESO_RELACAO.grupo;
  if (LIGACOES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return PESO_RELACAO.ligacao;
  return PESO_RELACAO.nenhuma;
}
/* Resultado que o aluno vê: o 1º lugar pela afinidade bruta; do 2º em diante, a afinidade é ponderada
   pela relação com o 1º, para o top 5 ser coerente (modalidades do mesmo grupo vêm antes). */
function calcular(comDesempate = true) {
  const [top, ...resto] = calcularBruto(comDesempate);
  const ordenado = resto
    .map(x => { const peso = relacao(top.k, x.k); return { ...x, peso, af: x.taxa * peso, pct: Math.round(100 * x.taxa * peso) }; })
    .sort((a, b) => b.af - a.af || b.taxa - a.taxa || state.sorteio.indexOf(a.k) - state.sorteio.indexOf(b.k));
  return [{ ...top, peso: 1, af: top.taxa }, ...ordenado];
}

/* Pede desempate quando as duas primeiras ficam a no máximo uma resposta de distância. */
function precisaDesempate() {
  const [a, b] = calcularBruto(false);
  const umaResposta = 1 / Math.max(1, (a.vezes + b.vezes) / 2);
  return a.taxa - b.taxa <= umaResposta + 1e-9;
}

function idadeNoEvento() { return state.nasc ? CONFIG.anoEvento - state.nasc : null; }
function elegivel(k) {
  const idade = idadeNoEvento(), max = MODALIDADES[k].idadeMax;
  return idade == null || max == null ? null : idade <= max;
}
function primeiroNome() { return state.nome.trim(); }
function virgulaNome(antes = "") { return primeiroNome() ? `${antes}, ${esc(primeiroNome())}` : antes; }

/* ---------- Sons (Web Audio, sem arquivos) ---------- */
const Som = {
  ligado: LS.get("skillmatch:som", true), ctx: null,
  tocar(notas) {
    if (!this.ligado) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx, t0 = c.currentTime + 0.01;
      notas.forEach(([f, ini, dur, vol = 0.07, tipo = "triangle"]) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = tipo; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + ini);
        g.gain.exponentialRampToValueAtTime(vol, t0 + ini + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + ini + dur);
        o.connect(g).connect(c.destination);
        o.start(t0 + ini); o.stop(t0 + ini + dur + 0.03);
      });
    } catch (e) { /* sem áudio */ }
  },
  escolha() { this.tocar([[660, 0, 0.08], [990, 0.05, 0.1]]); },
  passar() { this.tocar([[440, 0, 0.06, 0.04], [880, 0.03, 0.08, 0.03]]); },
  tique() { this.tocar([[1200, 0, 0.03, 0.03, "square"]]); },
  revelar() { this.tocar([[523, 0, 0.18], [659, 0.1, 0.18], [784, 0.2, 0.2], [1047, 0.32, 0.6, 0.09]]); }
};

/* ---------- Registro de resultados ---------- */
function registrar(dado) {
  const lista = LS.get(REG_KEY, []);
  const idx = lista.findIndex(d => d.id === dado.id);
  if (idx >= 0) lista[idx] = { ...lista[idx], ...dado }; else lista.push(dado);
  LS.set(REG_KEY, lista);
  if (!CONFIG.registroUrl) return;
  try {
    fetch(CONFIG.registroUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(dado) }).catch(() => {});
  } catch (e) { /* sem rede */ }
}
function registrarResultado(r) {
  if (state.registrado) return;
  state.registrado = true;
  const idade = idadeNoEvento(), e = elegivel(r[0].k);
  registrar({
    id: state.id, data: new Date().toISOString(),
    modalidade: r[0].k, segunda: r[1].k, afinidade: r[0].pct,
    idade: idade ?? "", elegivel: e == null ? "" : e ? "sim" : "nao",
    desempate: state.desempate || "", expectativa: state.expectativa || "", teste: MODO_TESTE ? "sim" : "",
    respostas: state.itens.map((it, j) => `${it.id}:${state.respostas[j] || ""}`).join(" "),
    feedback: ""
  });
}

/* ---------- Formas decorativas (estrelas e losangos do símbolo, brilhos suaves) ---------- */
const ANIMS = ["flutua", "gira", "deriva"];
/* Só cantos e bordas, longe do texto: o conteúdo fica livre no centro. */
const CANTOS = ["top:9%;right:-5%", "top:24%;right:-9%", "bottom:13%;right:-6%", "bottom:15%;left:-7%", "top:46%;left:-10%"];
function formas(seed) {
  let s = (seed * 7919 + 17) % 233280;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const brilhos = [0, 1].map(j => `<i class="brilho" style="${j ? "bottom:-18%;left:-30%" : "top:-16%;right:-30%"};--d:${j * 0.2}s"></i>`).join("");
  const cantos = CANTOS.slice().sort(() => rnd() - 0.5).slice(0, 3);
  const pecas = cantos.map((pos, j) => {
    const tipo = j === 0 ? "estrela" : rnd() < 0.5 ? "estrela" : "losango";
    const tam = Math.round((tipo === "estrela" ? 46 : 60) + rnd() * 50);
    const cor = j === 2 ? "#d7111a" : "var(--ac)";
    return `<i class="forma f-${tipo} a-${ANIMS[Math.floor(rnd() * ANIMS.length)]}" style="${pos};--t:${tam}px;--c:${cor};--d:${(0.15 + j * 0.1).toFixed(2)}s;--v:${(4 + rnd() * 4).toFixed(1)}s"></i>`;
  }).join("");
  return brilhos + pecas + `<i class="faixa"></i>`;
}

/* ---------- Montagem das telas ---------- */
let timers = [];
function depois(ms, fn) { const t = setTimeout(fn, ms); timers.push(t); return t; }
function limparTimers() { timers.forEach(clearTimeout); timers = []; clearTimeout(Auto.timer); Auto.timer = null; }

function render() {
  limparTimers();
  const tela = TELAS[state.tela] || TELAS.inicio;
  const v = tela();
  const t = TEMAS[v.tema % TEMAS.length];
  [["--veu", t.veu], ["--base", t.base], ["--fg", t.fg], ["--ac", t.ac], ["--ac-ink", t.acInk]].forEach(([k, val]) => app.style.setProperty(k, val));
  document.documentElement.style.setProperty("--brilho", t.base);
  app.className = `story tema-${t.nome} cta-${t.cta}` + (v.classe ? " " + v.classe : "");
  app.innerHTML = `
    ${v.barras || ""}
    <header class="topo">
      <span class="marca"><img src="assets/simbolo.png" alt="" width="20" height="26">Team 1.01 · SkillMatch</span>
      <span class="topo-acoes">
        ${v.pausavel ? `<button class="icone" id="pausa" type="button" aria-label="Pausar">❚❚</button>` : ""}
        <button class="icone" id="som" type="button" aria-pressed="${Som.ligado}" aria-label="Som">${Som.ligado ? "♪" : "♪̸"}</button>
      </span>
    </header>
    <div class="formas" aria-hidden="true">${formas(v.seed ?? v.tema)}</div>
    <section class="conteudo" id="conteudo"><div class="miolo">${v.corpo}</div></section>
    ${v.rodape ? `<footer class="rodape">${v.rodape}</footer>` : ""}`;
  document.getElementById("som").onclick = () => { Som.ligado = !Som.ligado; LS.set("skillmatch:som", Som.ligado); render(); Som.escolha(); };
  const conteudo = document.getElementById("conteudo");
  conteudo.addEventListener("scroll", indicarRolagem, { passive: true });
  depois(700, indicarRolagem);
  ajustarTitulos();
  animarNumeros();
  v.ligar && v.ligar();
}

/* Em telas baixas, quando há conteúdo abaixo da dobra, esmaece a borda de baixo para indicar que dá para rolar. */
function indicarRolagem() {
  const c = document.getElementById("conteudo");
  if (c) app.classList.toggle("tem-mais", c.scrollHeight - c.scrollTop - c.clientHeight > 6);
}

/* Diminui a fonte dos títulos com palavras longas até caberem na largura. */
function ajustarTitulos() {
  app.querySelectorAll(".nome-mod, .grande").forEach(el => {
    el.style.fontSize = "";
    let tam = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth + 1 && tam > 20) { tam -= 2; el.style.fontSize = tam + "px"; }
  });
}

function barrasPerguntas() {
  return `<div class="barras" aria-hidden="true">${state.itens.map((_, j) =>
    `<span><i style="width:${j < state.i ? 100 : j === state.i ? 35 : 0}%"></i></span>`).join("")}</div>`;
}

const TELAS = {
  inicio() {
    return {
      tema: 0, seed: 1, classe: "intro",
      corpo: `
        <img class="logo-intro" src="assets/simbolo.png" alt="Team 1.01" width="84" height="111">
        <p class="kicker sobe" style="--d:.3s">Seletiva interna · ${esc(CONFIG.evento)}</p>
        <h1 class="mega"><span>Seu</span><span>Skill</span><span>Match</span></h1>
        <p class="medio sobe" style="--d:.8s">${state.itens.length} perguntas sobre o seu jeito.<br>${KEYS.length} modalidades. Um match.</p>
        <button class="cta sobe" style="--d:1s" id="go">Bora descobrir</button>
        <p class="mini sobe" style="--d:1.2s">Jogo de orientação, não é prova. Não precisa saber nada técnico.</p>
        <img class="brasao sobe" style="--d:1.4s" src="assets/brasao.png" alt="SENAI Roberto Simonsen" width="170" height="79">`,
      ligar() { document.getElementById("go").onclick = () => { Som.passar(); state.tela = "nome"; render(); }; }
    };
  },

  nome() {
    return {
      tema: 2, seed: 2,
      corpo: `
        <p class="kicker sobe">Antes de tudo</p>
        <h2 class="grande sobe" style="--d:.1s">Como te chamam?</h2>
        <form id="fNome" class="sobe" style="--d:.25s;display:grid;gap:18px">
          <input class="entrada" id="nome" maxlength="24" autocomplete="given-name" placeholder="Seu primeiro nome" value="${esc(state.nome)}" aria-label="Seu primeiro nome">
          <button class="cta" type="submit">Continuar</button>
        </form>`,
      rodape: `<button class="linkbtn" id="voltar">← Voltar</button><button class="linkbtn" id="pular">Pular</button>`,
      ligar() {
        const inp = document.getElementById("nome");
        if (!matchMedia("(pointer: coarse)").matches) inp.focus();
        document.getElementById("fNome").onsubmit = ev => {
          ev.preventDefault();
          const n = inp.value.trim().split(/\s+/)[0] || "";
          state.nome = n && n[0].toUpperCase() + n.slice(1);
          Som.passar(); state.tela = "idade"; render();
        };
        document.getElementById("pular").onclick = () => { state.nome = ""; state.tela = "idade"; render(); };
        document.getElementById("voltar").onclick = () => { state.tela = "inicio"; render(); };
      }
    };
  },

  idade() {
    const anos = []; for (let a = CONFIG.anoEvento - 12; a >= CONFIG.anoEvento - 26; a--) anos.push(a);
    const idade = idadeNoEvento();
    let reacao = "";
    if (idade != null) {
      const ok = KEYS.filter(k => elegivel(k) === true).length;
      reacao = ok
        ? `Em ${CONFIG.anoEvento} você terá <b>${idade} anos</b>. Dá pra competir em <b>${ok} das ${KEYS.length}</b> modalidades.`
        : `Em ${CONFIG.anoEvento} você terá <b>${idade} anos</b>, acima do limite das modalidades. Fale com a coordenação.`;
    }
    return {
      tema: 4, seed: 3,
      corpo: `
        <p class="kicker sobe">${primeiroNome() ? `Prazer, ${esc(primeiroNome())}!` : "Prazer!"}</p>
        <h2 class="grande sobe" style="--d:.1s">Em que ano você nasceu?</h2>
        <p class="medio sobe" style="--d:.2s">A idade-limite elimina na competição, então a gente já confere pra você.</p>
        <div class="chips sobe" style="--d:.3s">${anos.map(a => `<button class="chip${state.nasc === a ? " on" : ""}" data-a="${a}">${a}</button>`).join("")}</div>
        <p class="reacao" aria-live="polite">${reacao}</p>
        <button class="cta" id="seguir" ${state.nasc ? "" : "hidden"}>Continuar</button>`,
      rodape: `<button class="linkbtn" id="voltar">← Voltar</button><button class="linkbtn" id="pular">Prefiro não dizer</button>`,
      ligar() {
        document.querySelectorAll(".chip").forEach(b => b.onclick = () => { state.nasc = Number(b.dataset.a); Som.escolha(); render(); });
        const seguir = () => { Som.passar(); state.tela = MODO_TESTE ? "teste" : "quiz"; marcarInicioQuiz(); render(); };
        document.getElementById("seguir").onclick = seguir;
        document.getElementById("pular").onclick = () => { state.nasc = null; seguir(); };
        document.getElementById("voltar").onclick = () => { state.tela = "nome"; render(); };
      }
    };
  },

  teste() {
    return {
      tema: 3, seed: 4,
      corpo: `
        <p class="kicker sobe">Modo teste</p>
        <h2 class="grande sobe" style="--d:.1s">Qual modalidade você acha que vai dar?</h2>
        <div class="pills sobe" style="--d:.2s">${KEYS.map(k => `<button class="pill${state.expectativa === k ? " on" : ""}" data-k="${k}">${esc(MODALIDADES[k].nome)}</button>`).join("")}
          <button class="pill" data-k="">Não sei</button></div>`,
      rodape: `<button class="linkbtn" id="voltar">← Voltar</button>`,
      ligar() {
        document.querySelectorAll(".pill").forEach(b => b.onclick = () => { state.expectativa = b.dataset.k; Som.escolha(); state.tela = "quiz"; marcarInicioQuiz(); render(); });
        document.getElementById("voltar").onclick = () => { state.tela = "idade"; render(); };
      }
    };
  },

  quiz() {
    const n = state.itens.length, i = state.i, it = state.itens[i], p = ITENS[it.id], resta = n - i - 1;
    state.t0 = performance.now();
    const corpo = p.duelo
      ? `<p class="kicker sobe">Isso ou aquilo · ${i + 1} de ${n}</p>
         <h2 class="pergunta sobe" style="--d:.05s">${esc(p.q)}</h2>
         ${duelo(it.ordem, k => esc(p.o[k]), state.respostas[i])}`
      : `<p class="kicker sobe">Pergunta ${i + 1} de ${n}</p>
         <h2 class="pergunta sobe" style="--d:.05s">${esc(p.q)}</h2>
         <div class="opcoes" role="group" aria-label="Opções">${it.ordem.map((k, j) =>
           `<button class="opcao sobe${state.respostas[i] === k ? " on" : ""}" style="--d:${(0.12 + j * 0.04).toFixed(2)}s" data-k="${k}"><span class="k">${j + 1}</span><span>${esc(p.o[k])}</span></button>`).join("")}</div>`;
    return {
      tema: [3, 1, 2, 4, 0, 5][i % 6], seed: 10 + i, barras: barrasPerguntas(),
      corpo,
      rodape: `<button class="linkbtn" id="voltar">← Voltar</button><span>${resta === 0 ? "Última!" : `Faltam ${resta}`}</span>`,
      ligar() {
        ligarEscolhas();
        document.getElementById("voltar").onclick = () => {
          if (state.i > 0) state.i--; else state.tela = MODO_TESTE ? "teste" : "idade";
          render();
        };
      }
    };
  },

  pausa() {
    const lider = MODALIDADES[calcular(false)[0].k];
    const traco = lider.tracos[0].toLowerCase();
    return {
      tema: 5, seed: 40, barras: barrasPerguntas(),
      corpo: `
        <p class="kicker sobe">Metade do caminho</p>
        <h2 class="grande sobe" style="--d:.1s">Tá ficando interessante${virgulaNome()}.</h2>
        <p class="medio sobe" style="--d:.4s">Até aqui, você respondeu como alguém com muito <mark>${esc(traco)}</mark>.</p>
        <p class="medio sobe" style="--d:.8s">Mas ainda dá tempo de tudo mudar.</p>
        <button class="cta sobe" style="--d:1.1s" id="seguir">Continuar</button>`,
      ligar() { document.getElementById("seguir").onclick = () => { Som.passar(); state.tela = "quiz"; render(); }; }
    };
  },

  desempate() {
    const r = calcularBruto(false); // o desempate é entre as duas maiores afinidades brutas
    if (!state.desempateOrdem) state.desempateOrdem = embaralhar([r[0].k, r[1].k]);
    return {
      tema: 1, seed: 50,
      corpo: `
        <p class="kicker sobe">Desempate · ${state.itens.length} de ${state.itens.length}</p>
        <h2 class="pergunta sobe" style="--d:.05s">Deu quase empate! Qual dessas provas você faria?</h2>
        ${duelo(state.desempateOrdem, k => `<b>${esc(MODALIDADES[k].nome)}</b><small>${esc(MODALIDADES[k].texto)}</small>`, state.desempate)}`,
      rodape: `<button class="linkbtn" id="voltar">← Voltar</button><span>Desempate</span>`,
      ligar() {
        ligarEscolhas();
        document.getElementById("voltar").onclick = () => { state.tela = "quiz"; state.desempateOrdem = null; render(); };
      }
    };
  },

  wrapped() {
    const r = calcular(), slides = slidesResultado(r);
    state.slide = Math.min(state.slide, slides.length - 1);
    const s = slides[state.slide];
    registrarResultado(r);
    precarregarFoto(r[0].k);
    return {
      ...s, classe: "wrapped", pausavel: !!s.dur,
      barras: `<div class="barras" aria-hidden="true">${slides.map((x, j) =>
        `<span><i class="${j === state.slide && x.dur ? "enchendo" : ""}" style="width:${j < state.slide || (j === state.slide && !x.dur) ? 100 : 0}%;--dur:${x.dur || 0}ms"></i></span>`).join("")}</div>`,
      rodape: s.rodape ?? `<span>Toque para avançar</span>`,
      ligar() {
        s.ligar && s.ligar();
        const p = document.getElementById("pausa");
        if (p) p.onclick = ev => { ev.stopPropagation(); Auto.pausado ? Auto.retomar() : Auto.pausar(); };
        if (s.dur) Auto.iniciar(s.dur);
      }
    };
  }
};

function marcarInicioQuiz() { state.i = 0; }

function duelo(ordem, texto, marcada) {
  return `<div class="duelo" role="group" aria-label="Opções">
    <button class="lado lado-a sobe${marcada === ordem[0] ? " on" : ""}" style="--d:.15s" data-k="${ordem[0]}"><span class="k">1</span><span class="t">${texto(ordem[0])}</span></button>
    <span class="vs sobe" style="--d:.25s" aria-hidden="true">ou</span>
    <button class="lado lado-b sobe${marcada === ordem[1] ? " on" : ""}" style="--d:.3s" data-k="${ordem[1]}"><span class="k">2</span><span class="t">${texto(ordem[1])}</span></button>
  </div>`;
}
function ligarEscolhas() { app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => escolher(b.dataset.k)); }

let travado = false;
function escolher(k) {
  if (travado) return;
  travado = true;
  Som.escolha();
  if (state.tela === "desempate") state.desempate = k;
  else { state.respostas[state.i] = k; state.tempos[state.i] = performance.now() - (state.t0 || performance.now()); }
  app.classList.add("escolheu");
  app.querySelectorAll("[data-k]").forEach(b => b.classList.toggle("on", b.dataset.k === k));
  depois(420, () => {
    travado = false;
    app.classList.remove("escolheu");
    const meio = Math.floor(state.itens.length / 2) - 1;
    const proximo = state.itens[state.i + 1];
    if (state.tela === "desempate") { state.tela = "wrapped"; state.slide = 0; }
    // A última pergunta vira o desempate quando as duas primeiras estão empatadas: o jogo tem sempre o mesmo total.
    else if (proximo?.final && precisaDesempate()) { state.tela = "desempate"; state.desempate = null; }
    else if (proximo) {
      if (state.i === meio && !state.pausaVista) { state.pausaVista = true; state.i++; state.tela = "pausa"; }
      else state.i++;
    }
    else { state.tela = "wrapped"; state.slide = 0; }
    render();
  });
}

/* ---------- Sequência do resultado (estilo retrospectiva) ---------- */
const Auto = {
  timer: null, inicio: 0, restante: 0, pausado: false,
  iniciar(ms) { this.restante = ms; this.pausado = false; this.retomar(); },
  retomar() {
    this.pausado = false; app.classList.remove("pausado");
    this.inicio = Date.now();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => irSlide(1), this.restante);
    const b = document.getElementById("pausa"); if (b) { b.textContent = "❚❚"; b.setAttribute("aria-label", "Pausar"); }
  },
  pausar() {
    if (!this.timer) return;
    clearTimeout(this.timer); this.timer = null;
    this.restante -= Date.now() - this.inicio;
    this.pausado = true; app.classList.add("pausado");
    const b = document.getElementById("pausa"); if (b) { b.textContent = "▶"; b.setAttribute("aria-label", "Continuar"); }
  }
};
function irSlide(delta) {
  if (state.tela !== "wrapped") return;
  const total = slidesResultado(calcular()).length;
  const novo = state.slide + delta;
  if (novo < 0 || novo >= total) return;
  state.slide = novo;
  Som.passar();
  render();
}

function formatarTempo(ms) {
  const s = Math.round(ms / 1000), m = Math.floor(s / 60);
  return m ? `${m} min ${String(s % 60).padStart(2, "0")} s` : `${s} s`;
}

function slidesResultado(r) {
  const top = MODALIDADES[r[0].k], n = state.itens.length;
  const slides = [];

  slides.push({ id: "intro", dur: 4200, tema: 3, seed: 60, corpo: `
    <p class="kicker sobe">Seu resultado</p>
    <h2 class="grande sobe" style="--d:.15s">Pronto${virgulaNome()}.</h2>
    <p class="medio sobe" style="--d:.7s">Suas ${n} respostas foram cruzadas com as ${KEYS.length} modalidades da seletiva.</p>
    <p class="medio sobe" style="--d:1.4s">Vamos ver o que elas dizem sobre você.</p>` });

  const tempos = state.tempos.filter(t => t > 0);
  if (tempos.length >= n - 1) {
    const total = tempos.reduce((a, b) => a + b, 0);
    let jr = 0; state.tempos.forEach((t, j) => { if (t > 0 && t < state.tempos[jr]) jr = j; });
    const it = state.itens[jr], p = ITENS[it.id], resp = p.o[state.respostas[jr]];
    slides.push({ id: "ritmo", dur: 6500, tema: 1, seed: 61, corpo: `
      <p class="kicker sobe">Seu ritmo</p>
      <p class="medio sobe" style="--d:.1s">Você respondeu tudo em</p>
      <p class="numero sobe" style="--d:.2s">${formatarTempo(total)}</p>
      <p class="medio sobe" style="--d:1.2s">Sua decisão mais rápida levou <b>${(state.tempos[jr] / 1000).toFixed(1).replace(".", ",")} s</b>:</p>
      <p class="mini sobe" style="--d:1.5s">${esc(p.q)}</p>
      <blockquote class="citacao sobe" style="--d:1.8s">“${esc(resp)}”</blockquote>
      <p class="medio sobe" style="--d:2.6s">Sem pensar duas vezes.</p>` });
  }

  slides.push({ id: "top5", dur: 7000, tema: 2, seed: 62, corpo: `
    <p class="kicker sobe">Seu top 5</p>
    <h2 class="grande sobe" style="--d:.1s">Suas modalidades com mais afinidade</h2>
    <ol class="top">${r.slice(0, 5).map((x, j) => {
      const atraso = j === 0 ? 2.9 : 0.5 + (4 - j) * 0.5;
      return `<li class="entra${j === 0 ? " misterio" : ""}" style="--d:${atraso}s">
        <span class="pos">${j + 1}</span>
        <span class="nm">${j === 0 ? "? ? ?" : esc(MODALIDADES[x.k].nome)}</span>
        <span class="pc">${j === 0 ? "" : x.pct + "%"}</span></li>`;
    }).join("")}</ol>` });

  const nFotos = FOTOS[r[0].k]?.fotos.length || 0;
  slides.push({ id: "revela", dur: nFotos ? Math.round((CARROSSEL.inicio + CARROSSEL.voltas * nFotos * CARROSSEL.porFoto) * 1000) : 7500, tema: 0, seed: 63, classe: "revelacao", corpo: `
    <p class="medio sobe" style="--d:.1s">E a sua modalidade nº 1 é…</p>
    <div class="revela">
      <span class="kicker">Ocupação ${top.codigo}</span>
      <h2 class="nome-mod">${esc(top.nome)}</h2>
      <p class="pct-grande"><span data-conta="${r[0].pct}">0</span>% de afinidade</p>
    </div>
    ${fotoModalidade(r[0].k)}`,
    ligar() {
      if (reduzMovimento()) { Som.revelar(); return; }
      [0, 1, 2, 3, 4, 5, 6].forEach(j => depois(300 + j * 170, () => Som.tique()));
      depois(1650, () => { Som.revelar(); confete(); animarNumeros(true); });
    } });

  slides.push({ id: "perfil", dur: 7000, tema: 5, seed: 64, corpo: `
    <p class="kicker sobe">Seu jeito em 3 palavras</p>
    <ul class="palavras">${top.tracos.map((t, j) => `<li class="entra" style="--d:${0.3 + j * 0.45}s">${esc(t)}</li>`).join("")}</ul>
    <p class="medio sobe" style="--d:1.8s">${esc(top.texto)}</p>` });

  slides.push({ id: "idade", dur: 7000, tema: 4, seed: 65, corpo: slideIdade(r) });

  slides.push({ id: "prova", dur: top.midia ? 0 : 8000, tema: 2, seed: 66, corpo: slideProva(top), ligar: ligarProva });

  slides.push({ id: "resumo", dur: 0, tema: 3, seed: 67, classe: "resumo", rodape: `<button class="linkbtn" id="rever">↺ Ver de novo</button><button class="linkbtn" id="again">Jogar de novo</button>`, corpo: slideResumo(r),
    ligar() { ligarResumo(r); } });

  return slides;
}

/* Foto oficial da WorldSkills; se não carregar (sem internet), o bloco some sem deixar buraco. */
/* Carrossel com as 3 fotos da modalidade, no tempo do story: começa logo depois da revelação e dá
   "voltas" completas até o fim do slide. A troca é feita por animações CSS em ciclo (jogo.css espera 3 fotos),
   então pausar o story (segurar o dedo) também pausa o carrossel. Sem internet, a foto que não carregar é retirada. */
const CARROSSEL = { inicio: 2.4, porFoto: 1.35, voltas: 2 };
function urlFoto([id, codigo], tam) { return `https://live.staticflickr.com/65535/${id}_${codigo}_${tam}.jpg`; }
function fotoModalidade(k) {
  const f = FOTOS[k];
  if (!f || !f.fotos.length) return "";
  const nome = esc(MODALIDADES[k].nome), { inicio, porFoto } = CARROSSEL;
  const ciclo = `--ciclo:${(porFoto * f.fotos.length).toFixed(2)}s`;
  const atraso = j => `--t:${(inicio + j * porFoto).toFixed(2)}s`;
  const imgs = f.fotos.map((foto, j) => `
      <img src="${urlFoto(foto, "c")}" srcset="${urlFoto(foto, "c")} 800w, ${urlFoto(foto, "b")} 1024w" sizes="(max-width: 460px) 92vw, 420px"
        style="${atraso(j)}" alt="Foto ${j + 1} de ${f.fotos.length}: competidor na prova de ${nome} na WorldSkills 2026" onerror="fotoFalhou(this)">`).join("");
  const pontos = f.fotos.map((_, j) => `<i style="${atraso(j)}"></i>`).join("");
  return `<figure class="foto-ws" style="${ciclo}">
    <div class="carrossel">${imgs}</div>
    <figcaption><span class="pontos" aria-hidden="true">${pontos}</span>
      <span>Fotos: <a href="https://www.flickr.com/photos/worldskills/albums/${f.album}/" target="_blank" rel="noopener">WorldSkills</a> · CC BY-NC-ND 4.0</span></figcaption>
  </figure>`;
}
function fotoFalhou(img) {
  const fig = img.closest("figure");
  img.remove();
  if (fig && !fig.querySelector(".carrossel img")) fig.remove();
}
/* Carrega as fotos enquanto o aluno ainda vê os primeiros slides do resultado. */
function precarregarFoto(k) {
  const f = FOTOS[k];
  if (f && precarregarFoto.k !== k) { precarregarFoto.k = k; f.fotos.forEach(foto => { new Image().src = urlFoto(foto, "c"); }); }
}

function slideIdade(r) {
  const k = r[0].k, m = MODALIDADES[k], idade = idadeNoEvento(), e = elegivel(k);
  if (idade == null || e === null) return `
    <p class="kicker sobe">Idade-limite</p>
    <p class="numero sobe" style="--d:.15s">${esc(m.idade)}</p>
    <p class="medio sobe" style="--d:.6s">${idade == null ? "É critério eliminatório na competição: confira antes de se inscrever." : `Em ${CONFIG.anoEvento} você terá ${idade} anos.`}</p>`;
  if (e) return `
    <p class="kicker sobe">Idade-limite</p>
    <p class="numero sobe" style="--d:.15s"><span data-conta="${idade}">0</span> anos</p>
    <p class="medio sobe" style="--d:.6s">é a idade que você terá em ${CONFIG.anoEvento}. O limite de ${esc(m.nome)} é ${esc(m.idade.replace(/ em \d+$/, ""))}.</p>
    <p class="selo sobe" style="--d:1.1s">✓ Você pode competir</p>`;
  const alt = r.find(x => elegivel(x.k) === true);
  return `
    <p class="kicker sobe">Atenção à idade</p>
    <p class="numero sobe" style="--d:.15s"><span data-conta="${idade}">0</span> anos</p>
    <p class="medio sobe" style="--d:.6s">é a idade que você terá em ${CONFIG.anoEvento}. O limite de ${esc(m.nome)} é ${esc(m.idade.replace(/ em \d+$/, ""))}, e isso elimina na competição.</p>
    ${alt ? `<p class="medio sobe" style="--d:1.2s">Dentro da sua idade, o seu melhor match é <mark>${esc(MODALIDADES[alt.k].nome)}</mark> (${alt.pct}%).</p>`
      : `<p class="medio sobe" style="--d:1.2s">Fale com a coordenação para ver as opções.</p>`}`;
}

function slideProva(m) {
  const md = m.midia;
  let midia = "";
  if (md && md.tipo === "youtube") midia = `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(md.id)}" title="${esc(md.legenda || "Prova de " + m.nome)}" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
  else if (md && md.tipo === "imagem") midia = `<img class="foto" src="${esc(md.src)}" alt="${esc(md.legenda || "Prova de " + m.nome)}" loading="lazy">`;
  const dp = m.depoimento;
  const busca = "https://www.youtube.com/results?search_query=" + encodeURIComponent("WorldSkills " + m.en);
  return `
    <p class="kicker sobe">Como é a prova</p>
    <h2 class="grande sobe" style="--d:.1s">${esc(m.nome)} na prática</h2>
    ${midia ? `<div class="sobe" style="--d:.3s">${midia}</div>` : ""}
    ${dp ? `<blockquote class="depo sobe" style="--d:.5s">${dp.foto ? `<img src="${esc(dp.foto)}" alt="">` : ""}<div><p>“${esc(dp.texto)}”</p><footer><b>${esc(dp.nome)}</b>${dp.info ? " · " + esc(dp.info) : ""}</footer></div></blockquote>` : ""}
    <div class="acoes sobe" style="--d:.7s">
      ${m.prova ? `<button class="botao botao-destaque" id="abrirProva" type="button" aria-haspopup="dialog">ⓘ Entenda a prova</button>` : ""}
      <a class="botao" href="${busca}" target="_blank" rel="noopener">▶ Ver vídeos da prova</a>
    </div>
    ${painelProva(m)}`;
}

/* Painel "Entenda a prova": o que a modalidade faz, o que mais pesa na nota, um destaque e quem procurar na escola.
   As barras mostram o peso de cada item em relação ao item de maior peso; o número ao lado é a % real da nota. */
function painelProva(m) {
  const p = m.prova;
  if (!p) return "";
  const maior = Math.max(...p.pesos.map(([, v]) => v));
  return `<dialog class="painel-prova" id="painelProva" aria-labelledby="tProva">
    <div class="pp-topo"><span class="kicker">Ocupação ${m.codigo}</span><button class="icone" id="fecharProva" type="button" aria-label="Fechar">✕</button></div>
    <h3 id="tProva">${esc(m.nome)}</h3>
    <p class="pp-texto">${esc(p.resumo)}</p>
    <h4>O que mais pesa na nota</h4>
    <ul class="pesos">${p.pesos.map(([nome, v]) => `<li><span>${esc(nome)}</span><b>${v}%</b><i style="--w:${Math.round(100 * v / maior)}%"></i></li>`).join("")}</ul>
    ${p.destaque ? `<p class="pp-destaque">${esc(p.destaque)}</p>` : ""}
    ${m.procurar ? `<p class="pp-procurar">Quer saber mais? Procure ${esc(m.tratamento || "o/a professor/a")} <b>${esc(m.procurar)}</b> na escola.</p>` : ""}
    <a class="pp-link" href="${m.link}" target="_blank" rel="noopener">Documento completo da WorldSkills (em inglês)</a>
  </dialog>`;
}
/* Abrir o painel pausa o story; fechar retoma (só se fomos nós que pausamos). */
function ligarProva() {
  const dlg = document.getElementById("painelProva"), abrir = document.getElementById("abrirProva");
  if (!dlg || !abrir) return;
  let pausei = false;
  abrir.onclick = () => { pausei = !!Auto.timer; if (pausei) Auto.pausar(); dlg.showModal(); Som.escolha(); };
  document.getElementById("fecharProva").onclick = () => dlg.close();
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => { if (pausei && state.tela === "wrapped") Auto.retomar(); pausei = false; abrir.focus(); });
}

/* ---------- Resumo final ---------- */
/* Com o pré-preenchimento configurado, as modalidades recebidas vão marcadas
   (numa pergunta de caixas de seleção, o Google Forms aceita o mesmo campo repetido). */
function linkInscricao(ms) {
  const p = CONFIG.formPrefill;
  if (!p || !p.url) return CONFIG.formUrl;
  try {
    const u = new URL(p.url);
    u.searchParams.set("usp", "pp_url");
    if (p.campoNome && primeiroNome()) u.searchParams.set(p.campoNome, primeiroNome());
    if (p.campoModalidade) ms.forEach(m => u.searchParams.append(p.campoModalidade, m.nome));
    return u.toString();
  } catch (e) { return CONFIG.formUrl; }
}
/* Modalidades do match dentro da idade do aluno, da maior afinidade para a menor.
   A primeira é a que vai marcada no formulário; o aluno inclui as outras que quiser. */
function modalidadesInscricao(r) {
  const dentro = r.filter(x => elegivel(x.k) !== false);
  return dentro.length ? dentro : [r[0]];
}

function slideResumo(r) {
  const ms = [MODALIDADES[modalidadesInscricao(r)[0].k]];
  return `
    <p class="kicker sobe">Seu SkillMatch</p>
    <div class="resumo-grid">
      <div class="card-prev sobe" style="--d:.1s"><img id="cardPrev" alt="Seu card para o story"></div>
      <div class="resumo-acoes sobe" style="--d:.25s">
        <p class="mini">Mostre seu match e desafie os colegas.</p>
        <button class="cta" id="shareCard" disabled>Postar no story</button>
        <button class="botao" id="baixarCard" disabled>Baixar imagem</button>
      </div>
    </div>
    <section class="sugestoes sobe" style="--d:.35s" aria-labelledby="tInsc">
      <h3 class="titulo-insc" id="tInsc">Gostou do resultado?</h3>
      <p class="medio">Se tiver interesse, inscreva-se nas modalidades do seu match que mais combinam com você. Pode ser mais de uma!</p>
      <a class="cta cta-2" href="${esc(linkInscricao(ms))}" target="_blank" rel="noopener">Quero me inscrever</a>
    </section>
    <details class="todas sobe" style="--d:.4s"><summary>Ver afinidade com todas as modalidades</summary>
      <ol>${r.map(x => `<li><span>${esc(MODALIDADES[x.k].nome)}${elegivel(x.k) === false ? " <em>(fora da idade)</em>" : ""}</span><b>${x.pct}%</b></li>`).join("")}</ol>
    </details>
    <div class="feedback sobe" style="--d:.5s" id="feedback">${blocoFeedback()}</div>
    <p class="toast" id="toast" role="status"></p>`;
}
function blocoFeedback() {
  if (state.feedback) return `<p class="mini">Valeu! Sua resposta ajuda a melhorar o jogo.</p>`;
  return `<p class="mini">Esse resultado combina com você?</p>
    <div class="acoes">
      <button class="botao" data-fb="sim">Tem tudo a ver</button>
      <button class="botao" data-fb="mais_ou_menos">Mais ou menos</button>
      <button class="botao" data-fb="nao">Não combina</button>
    </div>`;
}
function ligarResumo(r) {
  document.querySelectorAll("[data-fb]").forEach(b => b.onclick = () => {
    state.feedback = b.dataset.fb;
    registrar({ id: state.id, feedback: state.feedback });
    Som.escolha();
    document.getElementById("feedback").innerHTML = blocoFeedback();
  });
  document.getElementById("rever").onclick = () => { state.slide = 0; render(); };
  document.getElementById("again").onclick = () => { state = novoJogo("inicio", { nome: state.nome, nasc: state.nasc }); render(); };
  prepararCard(r);
}

/* ---------- Toques: avançar, voltar e segurar para pausar ---------- */
let segurando = null, segurou = false;
app.addEventListener("pointerdown", ev => {
  if (state.tela !== "wrapped" || ev.target.closest("a,button,input,details,iframe,dialog,.video,.depo")) return;
  segurou = false;
  segurando = setTimeout(() => { segurou = true; Auto.pausar(); }, 220);
});
app.addEventListener("pointerup", ev => {
  if (state.tela !== "wrapped" || ev.target.closest("a,button,input,details,iframe,dialog,.video,.depo")) return;
  clearTimeout(segurando);
  if (segurou) { segurou = false; Auto.retomar(); return; }
  const x = ev.clientX - app.getBoundingClientRect().left;
  irSlide(x < app.clientWidth * 0.3 ? -1 : 1);
});
app.addEventListener("pointercancel", () => { clearTimeout(segurando); if (segurou) { segurou = false; Auto.retomar(); } });

document.addEventListener("keydown", e => {
  if (document.querySelector("dialog[open]")) return; // com o painel aberto, as teclas são dele (Esc fecha)
  if (state.tela === "wrapped") {
    if (e.key === "ArrowRight") irSlide(1);
    else if (e.key === "ArrowLeft") irSlide(-1);
    else if (e.key === " " && !e.target.closest("button,a")) { e.preventDefault(); Auto.pausado ? Auto.retomar() : Auto.pausar(); }
    return;
  }
  if (state.tela !== "quiz" && state.tela !== "desempate") return;
  if (e.target.closest("input")) return;
  const n = parseInt(e.key, 10);
  const ordem = state.tela === "quiz" ? state.itens[state.i].ordem : state.desempateOrdem;
  if (ordem && n >= 1 && n <= ordem.length) escolher(ordem[n - 1]);
});

/* ---------- Efeitos ---------- */
function animarNumeros(agora = false) {
  app.querySelectorAll("[data-conta]").forEach(el => {
    const alvo = Number(el.dataset.conta);
    if (reduzMovimento()) { el.textContent = alvo; return; }
    if (el.closest(".revela") && !agora) return;
    const t0 = performance.now(), dur = 900;
    const passo = t => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  });
}

function confete() {
  if (reduzMovimento()) return;
  const box = document.createElement("div");
  box.className = "confete"; box.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 80; i++) {
    const s = document.createElement("i");
    s.style.cssText = `left:${Math.random() * 100}%;background:${CORES[i % CORES.length]};animation-delay:${Math.random() * 0.4}s;animation-duration:${1.8 + Math.random() * 1.6}s;--dx:${(Math.random() - 0.5) * 240}px;--r:${(Math.random() - 0.5) * 1080}deg`;
    box.appendChild(s);
  }
  app.appendChild(box);
  depois(4200, () => box.remove());
}

/* ---------- Card para story (1080×1920) ---------- */
let cardBlob = null, cardUrl = null;
async function prepararCard(r) {
  try {
    if (!cardBlob || prepararCard.id !== state.id) {
      cardBlob = await desenharCard(r);
      prepararCard.id = state.id;
      if (cardUrl) URL.revokeObjectURL(cardUrl);
      cardUrl = URL.createObjectURL(cardBlob);
    }
    const img = document.getElementById("cardPrev");
    if (!img) return;
    img.src = cardUrl;
    const share = document.getElementById("shareCard"), baixar = document.getElementById("baixarCard");
    share.disabled = baixar.disabled = false;
    share.onclick = compartilharCard;
    baixar.onclick = baixarCard;
  } catch (e) {
    document.querySelector(".card-prev")?.remove();
  }
}

async function compartilharCard() {
  const f = new File([cardBlob], "meu-skillmatch.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [f] })) {
    try { await navigator.share({ files: [f], title: "Meu SkillMatch" }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  baixarCard();
}
function baixarCard() {
  const a = document.createElement("a");
  a.href = cardUrl; a.download = "meu-skillmatch.png";
  document.body.appendChild(a); a.click(); a.remove();
  const t = document.getElementById("toast");
  if (t) t.textContent = "Imagem salva. Abra o Instagram e poste no seu story.";
}

function quebrar(x, txt, max) {
  const linhas = []; let l = "";
  txt.split(" ").forEach(p => { const t = l ? l + " " + p : p; if (l && x.measureText(t).width > max) { linhas.push(l); l = p; } else l = t; });
  if (l) linhas.push(l);
  return linhas;
}
function fonte(x, peso, tam, familia, largo = false) {
  x.font = `${peso} ${tam}px ${familia}`;
  if ("fontStretch" in x) x.fontStretch = largo ? "semi-expanded" : "normal";
}
function espaco(x, px) { if ("letterSpacing" in x) x.letterSpacing = px + "px"; }
function ajustar(x, txt, max, peso, tam, min, familia, largo) {
  fonte(x, peso, tam, familia, largo);
  while (x.measureText(txt).width > max && tam > min) { tam -= 2; fonte(x, peso, tam, familia, largo); }
  return tam;
}

function estrela(x, cx, cy, r, cor) {
  x.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
    x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
  }
  x.closePath(); x.fillStyle = cor; x.fill();
}
function carregarImagem(src) { const img = new Image(); img.src = src; return img.decode().then(() => img); }

async function desenharCard(r) {
  const SANS = "Montserrat, 'Segoe UI', sans-serif", SERIF = "'Inria Serif', Georgia, serif";
  try {
    await Promise.race([
      Promise.all(["800 120px Montserrat", "700 40px Montserrat", "600 40px Montserrat", "400 40px 'Inria Serif'", "italic 400 40px 'Inria Serif'"].map(f => document.fonts.load(f))),
      new Promise(res => setTimeout(res, 2500))
    ]);
  } catch (e) { /* usa fontes do sistema */ }
  const [simbolo, padronagem, brasao] = await Promise.all([MARCA.simbolo, MARCA.padronagem, MARCA.brasao]
    .map(src => src ? carregarImagem(src).catch(() => null) : null));

  const m = MODALIDADES[r[0].k], nome = primeiroNome();
  const W = 1080, H = 1920, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  const OURO = "#f3c94d", AZUL_CLARO = "#60a5fa", TEXTO_2 = "#c9d3ee";
  const ouro = (y0, y1) => { const g = x.createLinearGradient(0, y0, W, y1); g.addColorStop(0, "#d4a017"); g.addColorStop(1, "#f3c94d"); return g; };

  // Fundo: o mesmo degradê azul do site do Team 1.01
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#070e24"); g.addColorStop(0.55, "#0f2a6e"); g.addColorStop(1, "#2563eb");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const brilho = x.createRadialGradient(900, 280, 0, 900, 280, 560);
  brilho.addColorStop(0, "rgba(96,165,250,.32)"); brilho.addColorStop(1, "rgba(96,165,250,0)");
  x.fillStyle = brilho; x.fillRect(0, 0, W, H);
  if (padronagem) {
    const ph = 220, pw = padronagem.width * ph / padronagem.height;
    x.globalAlpha = 0.6;
    for (let px = -40; px < W; px += pw) x.drawImage(padronagem, px, H - ph, pw, ph);
    x.globalAlpha = 1;
  }
  estrela(x, 960, 1490, 46, OURO);
  estrela(x, 1010, 1600, 26, "#d7111a");
  estrela(x, 890, 1610, 18, "#d7111a");

  const M = 90, LW = W - 2 * M;
  x.textBaseline = "alphabetic";
  // Topo: símbolo do Team 1.01 à esquerda e brasão do SENAI Roberto Simonsen à direita, na mesma altura.
  const hSimbolo = simbolo ? 100 * simbolo.height / simbolo.width : 0;
  if (simbolo) x.drawImage(simbolo, M, 200, 100, hSimbolo);
  if (brasao) {
    const bw = 300, bh = bw * brasao.height / brasao.width;
    x.drawImage(brasao, W - M - bw, 200 + (hSimbolo - bh) / 2, bw, bh);
  }

  let y = 420;
  fonte(x, 700, 30, SANS); espaco(x, 5); x.fillStyle = OURO;
  x.fillText(`MEU SKILLMATCH · ${CONFIG.evento.toUpperCase()}`, M, y); espaco(x, 0);

  if (nome) {
    y += 120;
    ajustar(x, nome, LW, 800, 112, 56, SANS);
    x.fillStyle = "#ffffff"; x.fillText(nome + ",", M, y);
  }
  y += 72;
  fonte(x, "italic 400", 48, SERIF); x.fillStyle = TEXTO_2; x.fillText("minha modalidade nº 1 é", M, y);

  let tam = 112, linhas;
  do { fonte(x, 800, tam, SANS); linhas = quebrar(x, m.nome.toUpperCase(), LW); tam -= 4; }
  while ((linhas.length > 3 || linhas.some(l => x.measureText(l).width > LW)) && tam > 52);
  tam += 4; fonte(x, 800, tam, SANS);
  y += 20;
  const yIni = y;
  x.fillStyle = ouro(yIni, yIni + linhas.length * tam);
  linhas.forEach(l => { y += tam * 0.98; x.fillText(l, M, y); });

  y += 76;
  fonte(x, 700, 46, SANS); x.fillStyle = AZUL_CLARO; x.fillText(`${r[0].pct}% de afinidade`, M, y);

  y += 62;
  fonte(x, 400, 36, SERIF); x.fillStyle = TEXTO_2;
  quebrar(x, m.tracos.join(" · "), LW).forEach(l => { x.fillText(l, M, y); y += 46; });

  y += 34;
  fonte(x, 700, 28, SANS); espaco(x, 4); x.fillStyle = OURO; x.fillText("MEU TOP 3", M, y); espaco(x, 0);
  r.slice(0, 3).forEach((it, j) => {
    y += 74;
    fonte(x, 800, 52, SANS); x.fillStyle = j === 0 ? OURO : "#ffffff"; x.fillText(String(j + 1), M, y);
    const nm = MODALIDADES[it.k].nome;
    ajustar(x, nm, LW - 210, 600, 40, 24, SANS); x.fillStyle = "#ffffff";
    x.fillText(nm, M + 76, y);
    fonte(x, 700, 36, SANS); x.fillStyle = AZUL_CLARO;
    const pc = it.pct + "%"; x.fillText(pc, W - M - x.measureText(pc).width, y);
  });

  // Sem link: o jogo e a inscrição são internos da escola, então o card só convida a fazer o teste lá.
  let yb = Math.min(Math.max(y + 110, 1540), 1580);
  ajustar(x, "E você? Descubra a sua", LW, 800, 56, 34, SANS);
  x.fillStyle = "#ffffff"; x.fillText("E você? Descubra a sua", M, yb);
  yb += 60;
  const convite = `Faça o SkillMatch no ${CONFIG.escola.replace(/^Escola /, "")}`;
  ajustar(x, convite, LW, 400, 40, 26, SERIF); x.fillStyle = OURO; x.fillText(convite, M, yb);

  return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/png"));
}

render();
/* As fontes chegam depois do primeiro desenho; quando chegam, os títulos são reajustados. */
document.fonts?.ready.then(() => { ajustarTitulos(); indicarRolagem(); });
addEventListener("resize", () => { ajustarTitulos(); indicarRolagem(); });
