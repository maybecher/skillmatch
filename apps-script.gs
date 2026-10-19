/* Registro dos resultados do jogo numa Planilha Google.
   Como instalar: veja o LEIAME.md (seção "Registro dos resultados"). */

const ABA = "Resultados";
const CHAVE_PAINEL = "troque-esta-chave"; // o painel.html precisa desta chave para ler os dados
const COLUNAS = ["id", "data", "modalidade", "segunda", "afinidade", "idade", "elegivel",
  "desempate", "expectativa", "teste", "respostas", "feedback"];

/* O jogo envia um resultado novo ou atualiza um já enviado (ex.: quando o aluno responde se o resultado combinou). */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d.id) return saida({ ok: false });
    const aba = planilha();
    const n = Math.max(aba.getLastRow() - 1, 1);
    const ids = aba.getRange(2, 1, n, 1).getValues().map(l => String(l[0]));
    const linha = ids.indexOf(String(d.id));
    if (linha >= 0) {
      COLUNAS.forEach((c, j) => { if (c !== "id" && c in d) aba.getRange(linha + 2, j + 1).setValue(d[c]); });
    } else {
      aba.appendRow(COLUNAS.map(c => d[c] === undefined ? "" : d[c]));
    }
    return saida({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/* O painel lê os dados com ?chave=... */
function doGet(e) {
  if ((e.parameter.chave || "") !== CHAVE_PAINEL) return saida({ erro: "chave inválida" });
  const valores = planilha().getDataRange().getValues();
  const cab = valores.shift();
  const registros = valores.map(l => {
    const o = {};
    cab.forEach((c, j) => { o[c] = l[j] instanceof Date ? l[j].toISOString() : l[j]; });
    return o;
  });
  return saida({ registros });
}

function planilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName(ABA);
  if (!aba) {
    aba = ss.insertSheet(ABA);
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
  }
  return aba;
}

function saida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
