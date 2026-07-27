/**
 * API de backend para o app "Peso Ideal".
 * Roda como Web App do Google Apps Script, vinculado a uma Planilha Google.
 * A planilha atua como banco de dados (duas abas: "Pesos" e "Doses").
 *
 * COMO INSTALAR:
 * 1. Crie uma Planilha Google nova.
 * 2. Nela, crie duas abas chamadas exatamente: "Pesos" e "Doses"
 *    - Aba "Pesos": cabeçalho na linha 1 -> id | pessoa | data | peso
 *    - Aba "Doses": cabeçalho na linha 1 -> id | pessoa | data
 * 3. Menu Extensões > Apps Script. Apague o conteúdo padrão e cole este arquivo inteiro.
 * 4. Clique em Implantar > Nova implantação > tipo "App da Web".
 *    - Executar como: Eu (seu e-mail)
 *    - Quem pode acessar: Qualquer pessoa
 * 5. Copie a URL gerada (termina em /exec) e cole na constante API_URL do arquivo index.html.
 */

const SHEET_PESOS = "Pesos";
const SHEET_DOSES = "Doses";

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pesos = readSheet_(ss, SHEET_PESOS, ["id", "pessoa", "data", "peso"]);
  const doses = readSheet_(ss, SHEET_DOSES, ["id", "pessoa", "data"]);
  return jsonOutput_({ ok: true, pesos: pesos, doses: doses });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "addWeight") {
      appendRow_(ss, SHEET_PESOS, [body.id, body.pessoa, body.data, body.peso]);
      return jsonOutput_({ ok: true });
    }

    if (action === "deleteWeight") {
      deleteRowById_(ss, SHEET_PESOS, body.id);
      return jsonOutput_({ ok: true });
    }

    if (action === "addDose") {
      appendRow_(ss, SHEET_DOSES, [body.id, body.pessoa, body.data]);
      return jsonOutput_({ ok: true });
    }

    return jsonOutput_({ ok: false, error: "Ação desconhecida: " + action });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function readSheet_(ss, sheetName, headers) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values
    .filter(row => row[0] !== "" && row[0] !== null)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      // normaliza data para string ISO (yyyy-mm-dd), caso o Sheets tenha convertido em objeto Date
      if (obj.data instanceof Date) {
        obj.data = Utilities.formatDate(obj.data, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      return obj;
    });
}

function appendRow_(ss, sheetName, rowValues) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.appendRow(rowValues);
}

function deleteRowById_(ss, sheetName, id) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
    }
  }
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
