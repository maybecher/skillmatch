/* Lógica do jogo. Os textos, perguntas e configurações ficam em dados.js. */

const KEYS = Object.keys(MODALIDADES);
const ITENS = Object.fromEntries([...PERGUNTAS, ...DUELOS.map(d => ({ ...d, duelo: true }))].map(p => [p.id, p]));
const CORES = ["#fee300", "#ff6c0c", "#d51067", "#4a0d66", "#003764", "#0084ad", "#72d0eb", "#8ae2d1"];
const MODO_TESTE = new URLSearchParams(location.search).has("teste");
const REG_KEY = "skillmatch:registros";
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

/* As perguntas de 8 opções ficam na ordem do arquivo; os duelos entram intercalados a partir da 2ª. */
function montarItens() {
  const duelos = embaralhar(DUELOS);
  const seq = [];
  PERGUNTAS.forEach((p, j) => { seq.push(p.id); if (j >= 1 && duelos.length) seq.push(duelos.shift().id); });
  duelos.forEach(d => seq.push(d.id));
  return seq.map(id => ({ id, ordem: embaralhar(Object.keys(ITENS[id].o)) }));
}

function novoJogo(tela = "inicio", perfil = {}) {
  return { tela, nome: perfil.nome || "", nasc: perfil.nasc || null, expectativa: perfil.expectativa || "",
    i: 0, respostas: [], itens: montarItens(), desempate: null, desempateOrdem: null,
    id: novoId(), registrado: false, feedback: null };
}

function calcular(comDesempate = true) {
  const pts = Object.fromEntries(KEYS.map(k => [k, 0]));
  state.respostas.forEach(k => { if (k in pts) pts[k]++; });
  const d = comDesempate ? state.desempate : null;
  if (d in pts) pts[d]++;
  const total = Object.values(pts).reduce((a, b) => a + b, 0) || 1;
  return KEYS.map(k => ({ k, pts: pts[k], pct: Math.round(100 * pts[k] / total) }))
    .sort((a, b) => b.pts - a.pts || (b.k === d) - (a.k === d));
}
function precisaDesempate() { const r = calcular(false); return r[0].pts - r[1].pts <= 1; }

function idadeNoEvento() { return state.nasc ? CONFIG.anoEvento - state.nasc : null; }
function elegivel(k) {
  const idade = idadeNoEvento(), max = MODALIDADES[k].idadeMax;
  return idade == null || max == null ? null : idade <= max;
}
function primeiroNome() { return state.nome.trim(); }

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
  tique() { this.tocar([[1200, 0, 0.03, 0.03, "square"]]); },
  revelar() { this.tocar([[523, 0, 0.18], [659, 0.1, 0.18], [784, 0.2, 0.2], [1047, 0.32, 0.5, 0.09]]); }
};
function atualizarBotaoSom() {
  const b = document.getElementById("som");
  if (!b) return;
  b.textContent = Som.ligado ? "Som: ligado" : "Som: desligado";
  b.setAttribute("aria-pressed", String(Som.ligado));
}
document.getElementById("som")?.addEventListener("click", () => {
  Som.ligado = !Som.ligado; LS.set("skillmatch:som", Som.ligado); atualizarBotaoSom(); Som.escolha();
});
atualizarBotaoSom();

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

/* ---------- Telas ---------- */
let timerRevela = null;
function render() {
  clearTimeout(timerRevela);
  if (state.tela === "inicio") return telaInicio();
  if (state.tela === "quiz") return telaPergunta();
  if (state.tela === "desempate") return telaDesempate();
  if (state.tela === "revelando") return telaRevelando();
  return telaResultado();
}

function linhaModalidade(k) {
  const m = MODALIDADES[k], e = elegivel(k);
  const st = e === null ? "" : e ? `<b class="st ok">✓ pode</b>` : `<b class="st fora">✕ fora da idade</b>`;
  return `<li class="${e === false ? "fora" : ""}"><span class="code">${m.codigo}</span><span>${esc(m.nome)}</span><span class="age">${esc(m.idade)}${st}</span></li>`;
}
function resumoIdade() {
  const idade = idadeNoEvento();
  if (idade == null) return `<b>A idade-limite é eliminatória.</b> Informe o ano em que você nasceu para ver em quais modalidades pode competir.`;
  const ok = KEYS.filter(k => elegivel(k) === true).length, conf = KEYS.filter(k => elegivel(k) === null).length;
  if (!ok) return `<b>Em ${CONFIG.anoEvento} você terá ${idade} anos</b> e passa da idade-limite das modalidades com limite definido. Fale com a coordenação antes de se inscrever.`;
  return `<b>Em ${CONFIG.anoEvento} você terá ${idade} anos.</b> Você está dentro da idade em ${ok} das ${KEYS.length} modalidades${conf ? ` (${conf} sem limite confirmado: pergunte à coordenação)` : ""}.`;
}

function telaInicio() {
  const anos = []; for (let a = CONFIG.anoEvento - 12; a >= CONFIG.anoEvento - 26; a--) anos.push(a);
  const nItens = state.itens.length;
  app.innerHTML = `
    <form class="fade" id="perfil" style="display:grid;gap:22px">
      <h1>Qual é a sua <em>modalidade</em>?</h1>
      <p class="lead">${nItens} perguntas rápidas sobre o seu jeito de ser. Não precisa saber nada técnico: escolha a resposta que mais combina com você. No fim você descobre com qual das ${KEYS.length} modalidades da seletiva você tem mais afinidade.</p>
      <div class="campos">
        <label class="campo"><span>Seu primeiro nome</span>
          <input id="nome" name="nome" maxlength="24" autocomplete="given-name" placeholder="Ex.: Maria" value="${esc(state.nome)}"></label>
        <label class="campo"><span>Ano em que você nasceu</span>
          <select id="nasc" name="nasc"><option value="">Selecione</option>${anos.map(a => `<option ${state.nasc === a ? "selected" : ""}>${a}</option>`).join("")}</select></label>
        ${MODO_TESTE ? `<label class="campo largo"><span>Modo teste · Qual modalidade você acha que combina mais com você?</span>
          <select id="expectativa"><option value="">Não sei</option>${KEYS.map(k => `<option value="${k}" ${state.expectativa === k ? "selected" : ""}>${esc(MODALIDADES[k].nome)}</option>`).join("")}</select></label>` : ""}
      </div>
      <p class="aviso-idade" id="resumoIdade">${resumoIdade()}</p>
      <ul class="skills" id="lista">${KEYS.map(linhaModalidade).join("")}</ul>
      <div class="row"><button class="btn" type="submit">Começar o desafio</button><span class="note">Cerca de 5 minutos</span></div>
    </form>`;
  const nasc = document.getElementById("nasc");
  nasc.onchange = () => {
    state.nasc = nasc.value ? Number(nasc.value) : null;
    document.getElementById("lista").innerHTML = KEYS.map(linhaModalidade).join("");
    document.getElementById("resumoIdade").innerHTML = resumoIdade();
  };
  document.getElementById("perfil").onsubmit = ev => {
    ev.preventDefault();
    const nome = document.getElementById("nome").value.trim().split(/\s+/)[0] || "";
    const perfil = { nome: nome && nome[0].toUpperCase() + nome.slice(1), nasc: state.nasc,
      expectativa: document.getElementById("expectativa")?.value || "" };
    state = novoJogo("quiz", perfil);
    Som.escolha();
    render();
  };
}

function telaPergunta() {
  const n = state.itens.length, i = state.i, it = state.itens[i], p = ITENS[it.id];
  const resta = n - i - 1;
  app.innerHTML = `
    <div class="modules" style="--n:${n}" aria-hidden="true">
      ${state.itens.map((_, j) => `<span class="${j < i ? "done" : j === i ? "now" : ""}"></span>`).join("")}
    </div>
    <div class="slide" style="display:grid;gap:18px">
      <div class="qmeta"><span>Pergunta <b>${i + 1}</b> de ${n}${p.duelo ? ` · <b class="tag">Isso ou aquilo</b>` : ""}</span><span>${resta === 0 ? "Última!" : "Faltam " + resta}</span></div>
      <h2>${esc(p.q)}</h2>
      ${opcoes(it.ordem, k => p.o[k], state.respostas[i], p.duelo)}
      <div class="row" style="justify-content:space-between">
        <button class="linkbtn" id="back" ${i === 0 ? "disabled" : ""}>← Voltar</button>
        <span class="note">Dica: use as teclas 1–${it.ordem.length}</span>
      </div>
    </div>`;
  ligarOpcoes();
  document.getElementById("back").onclick = () => { if (state.i > 0) { state.i--; render(); } };
}

function opcoes(ordem, texto, marcada, duelo) {
  const botoes = ordem.map((k, j) => `<button class="opt${marcada === k ? " picked" : ""}" data-k="${k}"><span class="k">${j + 1}</span><span>${texto(k)}</span></button>`);
  return duelo
    ? `<div class="opts duel" role="group" aria-label="Opções">${botoes[0]}<span class="ou" aria-hidden="true">ou</span>${botoes[1]}</div>`
    : `<div class="opts" role="group" aria-label="Opções">${botoes.join("")}</div>`;
}
function ligarOpcoes() { app.querySelectorAll(".opt").forEach(b => b.onclick = () => escolher(b.dataset.k)); }

let travado = false;
function escolher(k) {
  if (travado) return;
  travado = true;
  Som.escolha();
  if (state.tela === "desempate") state.desempate = k; else state.respostas[state.i] = k;
  app.querySelector(".opts")?.classList.add("has-pick");
  app.querySelectorAll(".opt").forEach(b => b.classList.toggle("picked", b.dataset.k === k));
  setTimeout(() => {
    travado = false;
    if (state.tela === "desempate") state.tela = "revelando";
    else if (state.i < state.itens.length - 1) state.i++;
    else if (precisaDesempate()) { state.tela = "desempate"; state.desempate = null; }
    else state.tela = "revelando";
    render();
  }, 320);
}

function telaDesempate() {
  const r = calcular(false);
  if (!state.desempateOrdem) state.desempateOrdem = embaralhar([r[0].k, r[1].k]);
  const ordem = state.desempateOrdem;
  app.innerHTML = `
    <div class="slide" style="display:grid;gap:18px">
      <div class="qmeta"><span><b class="tag">Desempate</b></span><span>Pergunta extra</span></div>
      <h2>Deu quase empate! Qual dessas duas provas você escolheria fazer?</h2>
      ${opcoes(ordem, k => `<b class="opt-titulo">${esc(MODALIDADES[k].nome)}</b> ${esc(MODALIDADES[k].texto)}`, state.desempate, true)}
      <div class="row" style="justify-content:space-between">
        <button class="linkbtn" id="back">← Voltar</button>
        <span class="note">Dica: use as teclas 1–2</span>
      </div>
    </div>`;
  ligarOpcoes();
  document.getElementById("back").onclick = () => { state.tela = "quiz"; state.desempateOrdem = null; render(); };
}

function telaRevelando() {
  const nomes = embaralhar(KEYS).map(k => MODALIDADES[k].nome);
  app.innerHTML = `
    <div class="revelando" role="status">
      <span class="qmeta"><span>${primeiroNome() ? esc(primeiroNome()) + ", calculando" : "Calculando"} o seu perfil…</span></span>
      <div class="roleta"><span id="roleta">${esc(nomes[0])}</span></div>
      <div class="modules" style="--n:8" aria-hidden="true">${CORES.map(c => `<span style="background:${c};border-color:transparent"></span>`).join("")}</div>
    </div>`;
  const el = document.getElementById("roleta");
  const passos = reduzMovimento() ? 1 : 14;
  let j = 0;
  const girar = () => {
    j++;
    if (j >= passos) { state.tela = "resultado"; render(); return; }
    el.textContent = nomes[j % nomes.length];
    Som.tique();
    timerRevela = setTimeout(girar, 60 + j * j * 4);
  };
  timerRevela = setTimeout(girar, 200);
}

function linkInscricao(m) {
  const p = CONFIG.formPrefill;
  if (!p || !p.url) return CONFIG.formUrl;
  try {
    const u = new URL(p.url);
    u.searchParams.set("usp", "pp_url");
    if (p.campoNome && primeiroNome()) u.searchParams.set(p.campoNome, primeiroNome());
    if (p.campoModalidade) u.searchParams.set(p.campoModalidade, m.nome);
    return u.toString();
  } catch (e) { return CONFIG.formUrl; }
}

function blocoIdade(r) {
  const top = r[0].k, idade = idadeNoEvento(), e = elegivel(top), m = MODALIDADES[top];
  if (e === null) {
    return idade == null
      ? `<div class="alerta info"><b>Idade-limite: ${esc(m.idade)}.</b> É critério eliminatório: confira antes de se inscrever.</div>`
      : `<div class="alerta info"><b>Idade-limite: ${esc(m.idade)}.</b> Em ${CONFIG.anoEvento} você terá ${idade} anos.</div>`;
  }
  if (e) return `<div class="alerta ok"><b>✓ Você está dentro da idade.</b> Em ${CONFIG.anoEvento} você terá ${idade} anos, e o limite é ${esc(m.idade)}.</div>`;
  const alt = r.find(x => elegivel(x.k) === true);
  return `<div class="alerta fora"><b>Atenção: em ${CONFIG.anoEvento} você terá ${idade} anos e o limite desta modalidade é ${esc(m.idade)}.</b>
    A idade é critério eliminatório, então você não poderia competir nela.
    ${alt ? `A modalidade dentro da sua idade que mais combina com você é <b>${esc(MODALIDADES[alt.k].nome)}</b> (${alt.pct}%).` : "Fale com a coordenação para ver as opções."}</div>`;
}
function modalidadeInscricao(r) {
  if (elegivel(r[0].k) !== false) return r[0].k;
  return (r.find(x => elegivel(x.k) === true) || r[0]).k;
}

function blocoProva(m) {
  const md = m.midia;
  let midia = "";
  if (md && md.tipo === "youtube") midia = `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(md.id)}" title="${esc(md.legenda || "Prova de " + m.nome)}" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
  else if (md && md.tipo === "imagem") midia = `<img class="foto" src="${esc(md.src)}" alt="${esc(md.legenda || "Prova de " + m.nome)}" loading="lazy">`;
  if (midia && md.legenda) midia = `<figure>${midia}<figcaption class="note">${esc(md.legenda)}</figcaption></figure>`;
  const dp = m.depoimento;
  const depo = dp ? `
    <blockquote class="depo">
      ${dp.foto ? `<img src="${esc(dp.foto)}" alt="" loading="lazy">` : ""}
      <div><p>“${esc(dp.texto)}”</p><footer><b>${esc(dp.nome)}</b>${dp.info ? " · " + esc(dp.info) : ""}</footer></div>
    </blockquote>` : "";
  const busca = "https://www.youtube.com/results?search_query=" + encodeURIComponent("WorldSkills " + m.en);
  return `
    <section style="display:grid;gap:12px">
      <h3>Como é a prova na prática</h3>
      ${midia}${depo}
      <div class="row">
        <a class="btn ghost small" href="${busca}" target="_blank" rel="noopener">Ver vídeos da prova</a>
        <a class="btn ghost small" href="${m.link}" target="_blank" rel="noopener">Padrão da WorldSkills</a>
      </div>
    </section>`;
}

function telaResultado() {
  const r = calcular(), top = MODALIDADES[r[0].k], seg = MODALIDADES[r[1].k];
  const nome = primeiroNome(), mInsc = MODALIDADES[modalidadeInscricao(r)];
  const primeiraVez = !state.registrado;
  registrarResultado(r);
  app.innerHTML = `
    <div class="fade" style="display:grid;gap:22px">
      <div class="qmeta"><span>Resultado final</span><span>${CONFIG.evento}</span></div>
      <p class="saudacao">${nome ? `<b>${esc(nome)}</b>, sua` : "Sua"} modalidade é…</p>
      <div class="winner${primeiraVez ? " pop" : ""}">
        <span class="code">Ocupação ${top.codigo}</span>
        <h2>${esc(top.nome)}</h2>
        <span class="pct">${r[0].pct}% de afinidade</span>
        <p>${esc(top.texto)}</p>
        <div class="traits">${top.tracos.map(t => `<span>${esc(t)}</span>`).join("")}</div>
      </div>
      ${blocoIdade(r)}
      <div class="row">
        <a class="btn" href="${esc(linkInscricao(mInsc))}" target="_blank" rel="noopener">Fazer minha inscrição</a>
        <span class="note">${CONFIG.formPrefill?.url ? `Já vai com ${esc(mInsc.nome)} preenchida.` : `Na inscrição, escolha ${esc(mInsc.nome)}.`}</span>
      </div>

      <section class="story">
        <div class="story-prev"><img id="cardPrev" alt="Prévia do card para o story"></div>
        <div style="display:grid;gap:10px;align-content:center">
          <h3>Poste no seu story</h3>
          <p class="note">Mostre sua modalidade e desafie os colegas a descobrir a deles.</p>
          <div class="row">
            <button class="btn small" id="shareCard" disabled>Compartilhar</button>
            <button class="btn ghost small" id="baixarCard" disabled>Baixar imagem</button>
          </div>
        </div>
      </section>

      ${blocoProva(top)}

      <div class="facts">
        <div class="fact destaque"><small>Idade-limite</small><span>${esc(top.idade)}</span></div>
        <div class="fact"><small>Segunda opção</small><span>${esc(seg.nome)} · ${r[1].pct}%</span></div>
      </div>
      <div style="display:grid;gap:12px">
        <h3>Sua afinidade com cada modalidade</h3>
        <div class="bars">
          ${r.map((x, idx) => { const m = MODALIDADES[x.k], e = elegivel(x.k); return `
            <div class="bar ${idx === 0 ? "top" : idx === 1 ? "second" : ""}">
              <span class="name"><span class="code">${m.codigo}</span><span>${esc(m.nome)}</span>${e === false ? `<span class="st fora">fora da idade</span>` : ""}</span>
              <span class="val">${x.pct}%</span>
              <span class="track"><span class="fill" data-w="${x.pct}"></span></span>
            </div>`; }).join("")}
        </div>
      </div>

      <section class="feedback" id="feedback">${blocoFeedback()}</section>

      <div class="row">
        <button class="btn ghost" id="share">Copiar resultado</button>
        <button class="btn ghost" id="again">Jogar de novo</button>
      </div>
      <div class="toast" id="toast" role="status"></div>
    </div>`;
  requestAnimationFrame(() => app.querySelectorAll(".fill").forEach(f => f.style.width = f.dataset.w + "%"));
  if (primeiraVez) { Som.revelar(); confete(); }
  ligarFeedback();
  prepararCard(r);
  document.getElementById("again").onclick = () => { state = novoJogo("inicio", { nome: state.nome, nasc: state.nasc }); render(); window.scrollTo(0, 0); };
  document.getElementById("share").onclick = () => {
    const txt = `${nome ? nome + " aqui: f" : "F"}iz o jogo vocacional da ${CONFIG.evento} e minha modalidade é ${top.nome}. Faça o seu também: ${urlJogo()}`;
    const t = document.getElementById("toast");
    const ok = () => t.textContent = "Resultado copiado.";
    const fallback = () => { t.textContent = txt; const s = getSelection(), rg = document.createRange(); rg.selectNodeContents(t); s.removeAllRanges(); s.addRange(rg); };
    try { navigator.clipboard.writeText(txt).then(ok, fallback); } catch (e) { fallback(); }
  };
}

function blocoFeedback() {
  if (state.feedback) return `<p class="note">Obrigado! Sua resposta ajuda a coordenação a melhorar o jogo.</p>`;
  return `<h3>Esse resultado combina com você?</h3>
    <div class="row">
      <button class="btn ghost small" data-fb="sim">Sim, tem tudo a ver</button>
      <button class="btn ghost small" data-fb="mais_ou_menos">Mais ou menos</button>
      <button class="btn ghost small" data-fb="nao">Não combina</button>
    </div>`;
}
function ligarFeedback() {
  document.querySelectorAll("[data-fb]").forEach(b => b.onclick = () => {
    state.feedback = b.dataset.fb;
    registrar({ id: state.id, feedback: state.feedback });
    Som.escolha();
    document.getElementById("feedback").innerHTML = blocoFeedback();
  });
}

function confete() {
  if (reduzMovimento()) return;
  const box = document.createElement("div");
  box.className = "confete"; box.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 70; i++) {
    const s = document.createElement("i");
    s.style.cssText = `left:${Math.random() * 100}%;background:${CORES[i % CORES.length]};animation-delay:${Math.random() * 0.5}s;animation-duration:${1.8 + Math.random() * 1.6}s;--dx:${(Math.random() - 0.5) * 220}px;--r:${(Math.random() - 0.5) * 1080}deg`;
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4200);
}

/* ---------- Card para story (1080×1920) ---------- */
function urlJogo() {
  if (CONFIG.jogoUrl) return CONFIG.jogoUrl;
  return location.protocol.startsWith("http") ? location.origin + location.pathname.replace(/index\.html$/, "") : "";
}

let cardBlob = null, cardUrl = null;
async function prepararCard(r) {
  try {
    const blob = await desenharCard(r);
    if (!document.getElementById("cardPrev")) return;
    cardBlob = blob;
    if (cardUrl) URL.revokeObjectURL(cardUrl);
    cardUrl = URL.createObjectURL(blob);
    document.getElementById("cardPrev").src = cardUrl;
    const share = document.getElementById("shareCard"), baixar = document.getElementById("baixarCard");
    share.disabled = baixar.disabled = false;
    share.onclick = compartilharCard;
    baixar.onclick = baixarCard;
  } catch (e) {
    document.querySelector(".story")?.remove();
  }
}

function arquivoCard() { return new File([cardBlob], "minha-modalidade.png", { type: "image/png" }); }
async function compartilharCard() {
  const f = arquivoCard();
  if (navigator.canShare && navigator.canShare({ files: [f] })) {
    try { await navigator.share({ files: [f], title: "Minha modalidade" }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  baixarCard();
}
function baixarCard() {
  const a = document.createElement("a");
  a.href = cardUrl; a.download = "minha-modalidade.png";
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
function retangulo(x, X, Y, w, h, raio) {
  x.beginPath();
  if (x.roundRect) x.roundRect(X, Y, w, h, raio); else x.rect(X, Y, w, h);
}

async function desenharCard(r) {
  const DISP = "Archivo, 'Arial Narrow', sans-serif", BODY = "'Public Sans', system-ui, sans-serif", MONO = "'IBM Plex Mono', monospace";
  try {
    await Promise.race([
      Promise.all(["900 120px Archivo", "800 40px Archivo", "600 40px 'IBM Plex Mono'", "500 40px 'Public Sans'", "700 40px 'Public Sans'"].map(f => document.fonts.load(f))),
      new Promise(res => setTimeout(res, 2500))
    ]);
  } catch (e) { /* usa fontes do sistema */ }

  const m = MODALIDADES[r[0].k], nome = primeiroNome();
  const W = 1080, H = 1920, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");

  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#3d0b57"); g.addColorStop(1, "#14051e");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,.07)";
  for (let yy = 22; yy < H; yy += 44) for (let xx = 22; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.4, 0, Math.PI * 2); x.fill(); }
  CORES.forEach((cor, i) => { x.fillStyle = cor; x.fillRect(i * W / 8, 0, W / 8 + 1, 26); x.fillRect(i * W / 8, H - 26, W / 8 + 1, 26); });

  const M = 100, LW = W - 2 * M;
  x.textBaseline = "alphabetic";
  let y = 300;

  fonte(x, 600, 32, MONO); espaco(x, 5); x.fillStyle = "#72d0eb";
  x.fillText(`SELETIVA INTERNA · ${CONFIG.evento.toUpperCase()}`, M, y);
  espaco(x, 0);

  y += 150;
  if (nome) {
    let t = 130; fonte(x, 900, t, DISP, true);
    while (x.measureText(nome.toUpperCase() + ",").width > LW && t > 60) { t -= 6; fonte(x, 900, t, DISP, true); }
    x.fillStyle = "#ffffff"; x.fillText(nome.toUpperCase() + ",", M, y);
    y += 80;
    fonte(x, 500, 56, BODY); x.fillStyle = "#e6d8ef"; x.fillText("minha modalidade é…", M, y);
  } else {
    fonte(x, 900, 84, DISP, true); x.fillStyle = "#ffffff"; x.fillText("MINHA MODALIDADE", M, y);
    y += 80; fonte(x, 500, 56, BODY); x.fillStyle = "#e6d8ef"; x.fillText("na seletiva é…", M, y);
  }

  // Cartão branco com a modalidade
  const P = 60, CW = LW, IW = CW - 2 * P;
  let tam = 124, linhas;
  do { fonte(x, 900, tam, DISP, true); linhas = quebrar(x, m.nome.toUpperCase(), IW); tam -= 4; }
  while ((linhas.length > 3 || linhas.some(l => x.measureText(l).width > IW)) && tam > 56);
  tam += 4;
  const lh = tam * 0.98;
  fonte(x, 600, 34, BODY);
  const chips = []; let cx = 0, cy = 0;
  m.tracos.forEach(t => { const w = x.measureText(t).width + 56; if (cx && cx + w > IW) { cx = 0; cy += 76; } chips.push({ t, X: cx, Y: cy, w }); cx += w + 14; });
  const alturaChips = cy + 60;
  const CH = P + 40 + 40 + linhas.length * lh + 30 + 50 + 40 + alturaChips + P;
  const top0 = y + 70;

  x.save(); x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 50; x.shadowOffsetY = 18;
  x.fillStyle = "#ffffff"; retangulo(x, M, top0, CW, CH, 28); x.fill(); x.restore();
  x.save(); retangulo(x, M, top0, CW, CH, 28); x.clip();
  CORES.forEach((cor, i) => { x.fillStyle = cor; x.fillRect(M + i * CW / 8, top0, CW / 8 + 1, 14); });
  x.restore();

  let yy = top0 + P + 40;
  fonte(x, 600, 34, MONO); espaco(x, 3); x.fillStyle = "#d51067"; x.fillText(`OCUPAÇÃO ${m.codigo}`, M + P, yy); espaco(x, 0);
  yy += 40;
  fonte(x, 900, tam, DISP, true); x.fillStyle = "#24102f";
  linhas.forEach(l => { yy += lh; x.fillText(l, M + P, yy - tam * 0.12); });
  yy += 30 + 50;
  fonte(x, 900, 46, DISP, true); espaco(x, 2); x.fillStyle = "#d51067"; x.fillText(`${r[0].pct}% DE AFINIDADE`, M + P, yy); espaco(x, 0);
  yy += 40;
  fonte(x, 600, 34, BODY);
  chips.forEach(ch => {
    const X = M + P + ch.X, Y = yy + ch.Y;
    x.strokeStyle = "#4a0d66"; x.lineWidth = 3; retangulo(x, X, Y, ch.w, 60, 30); x.stroke();
    x.fillStyle = "#4a0d66"; x.fillText(ch.t, X + 28, Y + 42);
  });

  // Chamada final
  let yb = Math.max(top0 + CH + 150, 1440);
  let tc = 58; fonte(x, 800, tc, DISP, true);
  while (x.measureText("E VOCÊ? DESCUBRA A SUA").width > LW && tc > 36) { tc -= 2; fonte(x, 800, tc, DISP, true); }
  x.fillStyle = "#ffffff"; x.fillText("E VOCÊ? DESCUBRA A SUA", M, yb);
  const url = urlJogo().replace(/^https?:\/\//, "").replace(/\/$/, "");
  yb += 68;
  if (url) {
    let t = 40; fonte(x, 600, t, MONO);
    while (x.measureText(url).width > LW && t > 22) { t -= 2; fonte(x, 600, t, MONO); }
    x.fillStyle = "#8ae2d1"; x.fillText(url, M, yb);
  } else { fonte(x, 500, 44, BODY); x.fillStyle = "#8ae2d1"; x.fillText("Faça o jogo vocacional na escola", M, yb); }
  fonte(x, 600, 28, MONO); espaco(x, 4); x.fillStyle = "#b9a6c8";
  x.fillText(CONFIG.escola.toUpperCase(), M, Math.max(yb + 90, 1660)); espaco(x, 0);

  return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/png"));
}

/* ---------- Teclado e inicialização ---------- */
document.addEventListener("keydown", e => {
  if (state.tela !== "quiz" && state.tela !== "desempate") return;
  const n = parseInt(e.key, 10);
  const ordem = state.tela === "quiz" ? state.itens[state.i].ordem : state.desempateOrdem;
  if (ordem && n >= 1 && n <= ordem.length) escolher(ordem[n - 1]);
});

render();
